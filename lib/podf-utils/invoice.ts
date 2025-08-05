// lib/pdf-utils/invoice.ts

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { amiriFontBase64 } from "../amiri-font"; // تأكد من أن هذا المسار صحيح بالنسبة لمشروعك
import { logoBase64 } from "./logo";

// هذا الـ interface يجب أن يكون مطابقاً للـ interface في صفحة عرض الفاتورة
// The new, correct interface for BOTH files
interface InvoiceData {
  id: string;
  _id: string;
  invoiceNumber: string;
  title: string;
  totalInvoiceAmount: number;
  totalInvoiceCurrency: "EGP" | "USD";
  totalInvoiceExchangeRate?: number;
  paidAmount: number;
  restAmount: number;
  restAmountCurrency: "EGP" | "USD";
  restAmountExchangeRate?: number;

  extraIncoming: Array<{
    incomeType: string;
    amount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: string;
  }>;
  accommodation: Array<{
    city: string;
    name: string;
    totalAmount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: string;
  }>;
  nileCruises: Array<{
    name: string;
    totalAmount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: string;
  }>;
  domesticFlights: Array<{
    details: string;
    cost: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: string;
  }>;
  entranceTickets: Array<{
    site: string;
    cost: number;
    no: number;
    total: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
  }>;
  guide: Array<{
    city: string;
    name: string;
    cost: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: string;
  }>;
  transportation: Array<{
    supplierName: string;
    city: string;
    amount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: string;
  }>;

  grandTotalIncomeEGP: number;
  grandTotalExpensesEGP: number;
  restProfitEGP: number;

  fileNumber: string;
  supplierName: string;
  dueDate: string;
  paymentMethod: string;
  status: string;
}

// تعريف jsPDF للسماح باستخدام autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// دالة مساعدة لتنسيق العملة
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
// الدالة الأساسية لإنشاء ملف PDF
// الدالة الأساسية لإنشاء ملف PDF (النسخة الكاملة)
const generateInvoicePDFBlob = (invoice: InvoiceData): Blob => {
  const doc = new jsPDF();
  const pageHeight =
    doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth =
    doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  doc.addImage(logoBase64, "PNG", 15, 10, 50, 15); // الأرقام هي (x, y, width, height) ويمكنك تعديلها
  let y = 35;

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

  // --- 2. المعلومات الأساسية ---
  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { font: "Amiri", fontSize: 9 },
    body: [
      [
        `File Number: ${invoice.fileNumber}`,
        `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
      ],
      [
        `Supplier: ${invoice.supplierName}`,
        `Payment Method: ${invoice.paymentMethod}`,
      ],
      [`Status: ${invoice.status.toUpperCase()}`, ""],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // --- 3. تفاصيل الدخل ---
  doc.setFontSize(14);
  doc.text("Income Details", 14, y);
  y += 8;
  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: "#10B981", font: "Amiri" }, // أخضر
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
            invoice.totalInvoiceCurrency,
            invoice.totalInvoiceExchangeRate
          )
        ),
      ],
      [
        "Rest Amount (EGP)",
        formatCurrency(
          convertToEGP(
            invoice.restAmount,
            invoice.restAmountCurrency,
            invoice.restAmountExchangeRate
          )
        ),
      ],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Extra Incoming
  if (invoice.extraIncoming.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Extra Income Type", "Amount", "Status"]],
      body: invoice.extraIncoming.map((item) => [
        item.incomeType,
        formatCurrency(
          convertToEGP(item.amount, item.currency, item.exchangeRate)
        ),
        item.status,
      ]),
      theme: "striped",
      headStyles: { fillColor: "#0CA5E9", font: "Amiri" },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- 4. المصروفات ---
  checkPageBreak(20);
  doc.setFontSize(14);
  doc.text("Expenses Breakdown", 14, y);
  y += 8;

  // Accommodation
  if (invoice.accommodation.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["City", "Accommodation", "Amount (EGP)", "Status"]],
      body: invoice.accommodation.map((item) => [
        item.city,
        item.name,
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

  // Nile Cruises
  if (invoice.nileCruises && invoice.nileCruises.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Nile Cruise", "Amount (EGP)", "Status"]],
      body: invoice.nileCruises.map((item) => [
        item.name,
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

  // Domestic Flights
  if (invoice.domesticFlights.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Domestic Flights", "Cost", "Status"]],
      body: invoice.domesticFlights.map((item) => [
        item.details,
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

  // Entrance Tickets
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

  // Guide Expenses
  if (invoice.guide.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["City", "Guide", "Cost (EGP)", "Status"]],
      body: invoice.guide.map((item) => [
        item.city,
        item.name,
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

  // Transportation Expenses
  if (invoice.transportation.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Transportation (Supplier)", "City", "Amount", "Status"]],
      body: invoice.transportation.map((item) => [
        item.supplierName,
        item.city,
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

  // --- 5. الملخص المالي النهائي ---
  checkPageBreak(50);
  doc.setFontSize(16);
  doc.text("Financial Summary", 14, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: "#003366", font: "Amiri" },
    styles: { font: "Amiri" },
    body: [
      ["Grand Total Income (EGP)", formatCurrency(invoice.grandTotalIncomeEGP)],
      [
        "Grand Total Expenses (EGP)",
        formatCurrency(invoice.grandTotalExpensesEGP),
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

// --- دالة تحميل الـ PDF ---
export const downloadInvoicePDF = (invoice: InvoiceData) => {
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

// --- دالة مشاركة الـ PDF ---
export const shareInvoicePDF = async (
  invoice: InvoiceData,
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
