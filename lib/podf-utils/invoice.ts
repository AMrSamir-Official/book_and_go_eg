// lib/pdf-utils/invoice.ts

import { InvoiceTypes } from "@/types/invoice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { amiriFontBase64 } from "../amiri-font";
import { logoBase64 } from "./logo";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const formatCurrency = (amount: number, currency: string = "EGP") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount || 0);
};

const convertToEGP = (amount: number, currency: string, rate?: number) => {
  if (currency?.trim().toUpperCase() === "USD" && rate && rate > 0) {
    return amount * rate;
  }
  return amount;
};

// --- الدالة المحدثة والكاملة لإنشاء ملف PDF ---
const generateInvoicePDFBlob = (invoice: InvoiceTypes): Blob => {
  const doc = new jsPDF();
  const pageHeight =
    doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth =
    doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  let y = 35;

  // إضافة الخط العربي والشعار
  doc.addImage(logoBase64, "PNG", 15, 10, 50, 15);
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFontBase64);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal", "UTF-8");
  doc.setFont("Amiri");

  const checkPageBreak = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - 20) {
      doc.addPage();
      y = 15;
    }
  };

  // --- 1. رأس الملف ---
  doc.setFontSize(22);
  doc.setTextColor("#003366");
  doc.text("Invoice", pageWidth / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor("#333333");
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, pageWidth / 2, y, {
    align: "center",
  });
  y += 6;
  doc.text(`Title: ${invoice.title}`, pageWidth / 2, y, { align: "center" });
  y += 15;

  // --- 2. المعلومات الأساسية (النسخة الكاملة) ---
  const basicInfoBody = [
    [`File Number: ${invoice.fileNumber}`, `Supplier: ${invoice.supplierName}`],
    [
      `Booking Date: ${
        invoice.bookingDate
          ? new Date(invoice.bookingDate).toLocaleDateString()
          : "N/A"
      }`,
      `Arrival File Date: ${
        invoice.arrivalFileDate
          ? new Date(invoice.arrivalFileDate).toLocaleDateString()
          : "N/A"
      }`,
    ],
    [
      `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
      `Main Payment Date: ${
        invoice.paymentDate
          ? new Date(invoice.paymentDate).toLocaleDateString()
          : "N/A"
      }`,
    ],
    [
      `Payment Method: ${invoice.paymentMethod}`,
      `Way of Payment: ${invoice.wayOfPayment || "N/A"}`,
    ],
    [`Status: ${invoice.status.toUpperCase()}`, ""],
  ];

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { font: "Amiri", fontSize: 9 },
    body: basicInfoBody,
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // --- 3. تفاصيل الدخل ---
  checkPageBreak(20);
  doc.setFontSize(14);
  doc.text("Income Details", 14, y);
  y += 8;
  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: "#10B981", font: "Amiri" },
    head: [["Description", "Amount"]],
    body: [
      [
        "Total Invoice (EGP)",
        formatCurrency(
          convertToEGP(
            invoice.totalInvoiceAmount,
            invoice.totalInvoiceCurrency,
            invoice.totalInvoiceExchangeRate
          )
        ),
      ],
      [
        "Paid Amount (EGP)",
        formatCurrency(
          convertToEGP(
            invoice.paidAmount,
            invoice.paidAmountCurrency,
            invoice.paidAmountExchangeRate
          )
        ),
      ],
      [
        { content: "Rest Amount (EGP)", styles: { fontStyle: "bold" } },
        {
          content: formatCurrency(invoice.restAmount),
          styles: { fontStyle: "bold" },
        },
      ],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Extra Incoming (النسخة الكاملة)
  if (invoice.extraIncoming.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Extra Income Type", "Date", "Amount", "Status", "Note"]],
      body: invoice.extraIncoming.map((item) => [
        item.incomeType,
        item.date ? new Date(item.date).toLocaleDateString() : "N/A",
        formatCurrency(
          convertToEGP(item.amount, item.currency, item.exchangeRate)
        ),
        item.status,
        item.note || "N/A",
      ]),
      theme: "striped",
      headStyles: { fillColor: "#0CA5E9", font: "Amiri" },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- 4. المصروفات (النسخة الكاملة) ---
  checkPageBreak(20);
  doc.setFontSize(14);
  doc.text("Expenses Breakdown", 14, y);
  y += 8;

  // Accommodation (كامل)
  if (invoice.accommodation.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [
        ["City", "Accommodation", "Payment Date", "Amount (EGP)", "Status"],
      ],
      body: invoice.accommodation.map((item) => [
        item.city,
        item.name,
        item.paymentDate
          ? new Date(item.paymentDate).toLocaleDateString()
          : "N/A",
        formatCurrency(
          convertToEGP(item.totalAmount, item.currency, item.exchangeRate)
        ),
        item.status,
      ]),
      theme: "striped",
      headStyles: { fillColor: "#4A5568", font: "Amiri" },
    });
    y = (doc as any).lastAutoTable.finalY + 5;
  }

  // Nile Cruises (كامل)
  if (invoice.nileCruises && invoice.nileCruises.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Nile Cruise", "Payment Date", "Amount (EGP)", "Status"]],
      body: invoice.nileCruises.map((item) => [
        item.name,
        item.paymentDate
          ? new Date(item.paymentDate).toLocaleDateString()
          : "N/A",
        formatCurrency(
          convertToEGP(item.totalAmount, item.currency, item.exchangeRate)
        ),
        item.status,
      ]),
      theme: "striped",
      headStyles: { fillColor: "#4A5568", font: "Amiri" },
    });
    y = (doc as any).lastAutoTable.finalY + 5;
  }

  // Domestic Flights (كامل)
  if (invoice.domesticFlights.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Domestic Flights", "Payment Date", "Cost", "Status"]],
      body: invoice.domesticFlights.map((item) => [
        item.details,
        item.paymentDate
          ? new Date(item.paymentDate).toLocaleDateString()
          : "N/A",
        formatCurrency(
          convertToEGP(item.cost, item.currency, item.exchangeRate)
        ),
        item.status,
      ]),
      theme: "striped",
      headStyles: { fillColor: "#4A5568", font: "Amiri" },
    });
    y = (doc as any).lastAutoTable.finalY + 5;
  }

  // Entrance Tickets (كامل)
  if (invoice.entranceTickets.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Entrance Tickets (Site)", "Cost", "No.", "Total"]],
      body: invoice.entranceTickets.map((item) => [
        item.site,
        formatCurrency(
          convertToEGP(item.cost, item.currency, item.exchangeRate)
        ),
        item.no,
        formatCurrency(
          convertToEGP(item.total, item.currency, item.exchangeRate)
        ),
      ]),
      theme: "striped",
      headStyles: { fillColor: "#4A5568", font: "Amiri" },
    });
    y = (doc as any).lastAutoTable.finalY + 5;
  }

  // Guide Expenses (كامل)
  if (invoice.guide.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["City", "Guide", "Payment Date", "Cost (EGP)", "Status"]],
      body: invoice.guide.map((item) => [
        item.city,
        item.name,
        item.paymentDate
          ? new Date(item.paymentDate).toLocaleDateString()
          : "N/A",
        formatCurrency(
          convertToEGP(item.cost, item.currency, item.exchangeRate)
        ),
        item.status,
      ]),
      theme: "striped",
      headStyles: { fillColor: "#4A5568", font: "Amiri" },
    });
    y = (doc as any).lastAutoTable.finalY + 5;
  }

  // Transportation Expenses (كامل)
  if (invoice.transportation.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [
        [
          "Supplier",
          "City",
          "Payment Date",
          "Site/Cost No.",
          "Amount",
          "Status",
        ],
      ],
      body: invoice.transportation.map((item) => [
        item.supplierName,
        item.city,
        item.paymentDate
          ? new Date(item.paymentDate).toLocaleDateString()
          : "N/A",
        item.siteCostNo || "N/A",
        formatCurrency(
          convertToEGP(item.amount, item.currency, item.exchangeRate)
        ),
        item.status,
      ]),
      theme: "striped",
      headStyles: { fillColor: "#4A5568", font: "Amiri" },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- 5. الملاحظات والتفاصيل الإضافية (أقسام جديدة) ---
  checkPageBreak(20);
  if (invoice.notes) {
    doc.setFontSize(14);
    doc.text("Notes", 14, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      body: [[invoice.notes]],
      theme: "plain",
      styles: { font: "Amiri", fontSize: 10, cellPadding: 2 },
      didDrawCell: (data) => {
        doc.setDrawColor(200);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
      },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  checkPageBreak(20);
  if (invoice.dynamicFields && invoice.dynamicFields.length > 0) {
    doc.setFontSize(14);
    doc.text("Additional Details", 14, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [["Label", "Value"]],
      body: invoice.dynamicFields.map((field) => [field.label, field.value]),
      theme: "grid",
      headStyles: { fillColor: "#4A5568", font: "Amiri" },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- 6. الملخص المالي النهائي (النسخة الكاملة) ---
  checkPageBreak(50);
  doc.setFontSize(16);
  doc.text("Financial Summary", 14, y);
  y += 10;
  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: "#003366" },
    styles: { font: "Amiri" },
    body: [
      ["Grand Total Income (EGP)", formatCurrency(invoice.grandTotalIncomeEGP)],
      [
        "Grand Total Expenses (EGP)",
        formatCurrency(invoice.grandTotalExpensesEGP),
      ],
      [
        {
          content: "Total Owed to Suppliers (EGP)",
          styles: { textColor: "#007BFF" },
        },
        {
          content: formatCurrency(invoice.totalOwedToSuppliers),
          styles: { textColor: "#007BFF" },
        },
      ],
      [
        {
          content: "Rest Profit (EGP)",
          styles: { fontStyle: "bold", textColor: "#10B981" },
        },
        {
          content: formatCurrency(invoice.restProfitEGP),
          styles: { fontStyle: "bold", textColor: "#10B981" },
        },
      ],
    ],
  });

  return doc.output("blob");
};

// --- الدوال المساعدة (بدون تغيير) ---
export const downloadInvoicePDF = (invoice: InvoiceTypes) => {
  try {
    const blob = generateInvoicePDFBlob(invoice);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert("An error occurred while generating the PDF.");
  }
};

export const shareInvoicePDF = async (
  invoice: InvoiceTypes,
  message: string
) => {
  const blob = generateInvoicePDFBlob(invoice);
  const file = new File([blob], `Invoice-${invoice.invoiceNumber}.pdf`, {
    type: "application/pdf",
  });
  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: "Invoice Details",
      text: message,
      files: [file],
    });
  } else {
    throw new Error("File sharing not supported.");
  }
};
