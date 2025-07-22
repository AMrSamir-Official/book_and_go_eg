import { BookingData } from "@/app/[locale]/bookings/[id]/print/booking-print-view";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { amiriFontBase64 } from "./amiri-font";
// In /lib/pdf-utils.ts
// import { amiriFontBase64 } from "./amiri-font"; // <-- أضف هذا السطر

// ... باقي الكود
// We need to tell TypeScript that the jsPDF instance will have the autoTable method
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Define the BookingData interface here as well, or import it

/**
 * @internal
 * A core function to generate the PDF and return it as a Blob.
 * Not exported because it's a helper for the other functions.
 */
// In /lib/pdf-utils.ts

// Replace the entire old generatePDFBlob function with this one.
const generatePDFBlob = (booking: BookingData): Blob => {
  const doc = new jsPDF();
  const pageHeight =
    doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth =
    doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  let y = 15;

  // Use the Amiri font for consistency
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFontBase64);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal", "UTF-8");
  doc.setFont("Amiri");

  // --- 1. Header ---
  doc.setFontSize(20);
  doc.setTextColor("#003366");
  doc.text("Complete Travel Operation Form", pageWidth / 2, y, {
    align: "center",
  });
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor("#333333");
  doc.text(`File Number: ${booking.fileNumber}`, pageWidth / 2, y, {
    align: "center",
  });
  y += 15;

  // --- 2. Basic Information ---
  doc.setFontSize(14);
  doc.text("1. Basic Booking Information", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`File Number: ${booking.fileNumber}`, 15, y);
  doc.text(`Nationality: ${booking.nationality}`, 110, y);
  y += 7;
  doc.text(`Supplier: ${booking.supplier}`, 15, y);
  doc.text(`Arrival Date: ${booking.arrivalDate}`, 110, y);
  y += 7;
  doc.text(`No. of Pax: ${booking.paxCount}`, 15, y);
  doc.text(`Departure Date: ${booking.departureDate}`, 110, y);
  y += 7;
  doc.text(`No. of Nights: ${booking.numberOfNights}`, 110, y);
  y += 15;

  // --- 3. Flight Details ---
  doc.setFontSize(14);
  doc.text("Flight Details", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(
    `Arrival: ${booking.arrivalFlight.airlineName} ${booking.arrivalFlight.flightNo} - ${booking.arrivalFlight.date} @ ${booking.arrivalFlight.time}`,
    15,
    y
  );
  y += 7;
  doc.text(
    `Departure: ${booking.departureFlight.airlineName} ${booking.departureFlight.flightNo} - ${booking.departureFlight.date} @ ${booking.departureFlight.time}`,
    15,
    y
  );
  y += 10;

  if (booking.domesticFlights.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Domestic Flights", "Date", "Time", "Route"]],
      body: booking.domesticFlights.map((f) => [
        `${f.airlineName} ${f.flightNo}`,
        f.date,
        f.time,
        `${f.departure} -> ${f.arrival}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: "#4A5568" },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- 4. Accommodation ---
  if (y > pageHeight - 40) {
    doc.addPage();
    y = 15;
  }
  doc.setFontSize(14);
  doc.text("2. Accommodation", 14, y);
  y += 2;
  autoTable(doc, {
    startY: y,
    head: [["Hotel Name", "Check-in", "Check-out", "Room Type", "Status"]],
    body: booking.hotels.map((h) => [
      h.name,
      h.checkIn,
      h.checkOut,
      h.roomType,
      h.status,
    ]),
    theme: "grid",
    headStyles: { fillColor: "#003366" },
  });
  y = (doc as any).lastAutoTable.finalY;

  // ✅ --- NEW: Nile Cruise Details ---
  if (booking.nileCruise && booking.nileCruise.name) {
    y += 5;
    const nileCruiseData = [
      ["Nile Cruise:", booking.nileCruise.name],
      [
        "Check-in/out:",
        `${booking.nileCruise.checkIn} / ${booking.nileCruise.checkOut}`,
      ],
      ["Cabin Type:", booking.nileCruise.cabinType],
      ["Status:", booking.nileCruise.status],
    ];
    autoTable(doc, {
      startY: y,
      body: nileCruiseData,
      theme: "plain",
      styles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: "bold" } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ✅ --- NEW: Itinerary & Cities Section ---
  if (y > pageHeight - 60) {
    doc.addPage();
    y = 15;
  }
  doc.setFontSize(14);
  doc.text("3. Itinerary & Cities", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor("#16a34a"); // Green
  doc.text("Include:", 15, y);
  y += 5;
  doc.setTextColor("#333333");
  let textLines = doc.splitTextToSize(booking.include, 180);
  doc.text(textLines, 15, y);
  y += textLines.length * 5 + 5;

  doc.setTextColor("#dc2626"); // Red
  doc.text("Exclude:", 15, y);
  y += 5;
  doc.setTextColor("#333333");
  textLines = doc.splitTextToSize(booking.exclude, 180);
  doc.text(textLines, 15, y);
  y += textLines.length * 5 + 5;

  // --- Daily Program ---
  if (y > pageHeight - 40) {
    doc.addPage();
    y = 15;
  }
  doc.setFontSize(14);
  doc.text("Daily Program", 14, y);
  y += 8;
  booking.dailyProgram.forEach((day) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 15;
    }
    doc.setFontSize(11);
    doc.setTextColor("#003366");
    doc.text(`Day ${day.day} - ${day.date} - ${day.city}`, 15, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor("#333333");
    const details = doc.splitTextToSize(day.details, 180);
    doc.text(details, 15, y);
    y += details.length * 5 + 5;
  });

  // ✅ --- NEW: Meeting & Assist ---
  if (y > pageHeight - 40) {
    doc.addPage();
    y = 15;
  }
  doc.setFontSize(14);
  doc.text("4. Meeting & Assist", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Pax Count: ${booking.meetingAssist.paxCount}`, 15, y);
  doc.text(`Nationality: ${booking.meetingAssist.nationality}`, 110, y);
  y += 7;
  doc.text(`Name: ${booking.meetingAssist.name}`, 15, y);
  y += 7;
  doc.text(`Flight Details: ${booking.meetingAssist.flightDetails}`, 15, y);
  y += 15;

  // --- Guide Details ---
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 15;
  }
  doc.setFontSize(14);
  doc.text("5. Guide Details", 14, y);
  autoTable(doc, {
    startY: y + 2,
    head: [["City", "Guide Name", "Language", "Pax", "Pickup"]],
    body: booking.guides.map((g) => [
      g.city,
      g.guideName,
      g.language,
      `${g.paxAdults}A + ${g.paxChildren}C`,
      g.pickupHotelLocation,
    ]),
    theme: "striped",
    headStyles: { fillColor: "#4A5568" },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ✅ --- NEW: Transportation Table ---
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 15;
  }
  doc.setFontSize(14);
  doc.text("6. Transportation", 14, y);
  autoTable(doc, {
    startY: y + 2,
    head: [["Type", "Route", "Date", "Vehicle", "Status"]],
    body: booking.transportation.map((t) => [
      t.type,
      `${t.from} -> ${t.to}`,
      t.date,
      t.vehicleType,
      t.status,
    ]),
    theme: "grid",
    headStyles: { fillColor: "#003366" },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // --- Footer on each page ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("Amiri");
    doc.setFontSize(9);
    doc.setTextColor("#888888");
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }

  return doc.output("blob");
};

/**
 * ✅ EXPORTED: Function for the "Download" button.
 * Generates the PDF blob and triggers a download link.
 */
export const downloadStyledPDF = (booking: BookingData) => {
  const blob = generatePDFBlob(booking);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Booking-${booking.fileNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * ✅ EXPORTED: Function for the "Share to WhatsApp" button.
 * Generates the PDF and uses the Web Share API to share the file.
 */
export const sharePDFToWhatsApp = async (
  booking: BookingData,
  message: string
) => {
  const blob = generatePDFBlob(booking);
  const filename = `Booking-${booking.fileNumber}.pdf`;
  const file = new File([blob], filename, { type: "application/pdf" });

  // Check if Web Share API is supported and can share files
  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        title: "Booking Details",
        text: message,
        files: [file], // Attach the actual file
      });
    } catch (error) {
      // This error is thrown if the user cancels the share dialog
      console.error("Sharing cancelled or failed", error);
      throw new Error("Sharing was cancelled.");
    }
  } else {
    // Fallback for desktop browsers or those that don't support file sharing
    throw new Error(
      "File sharing is not supported on this browser. Please download the PDF and share it manually."
    );
  }
};
// In /lib/pdf-utils.ts
// Make sure you have the AccountingData interface defined or imported here.
// You can create a central types.ts file for interfaces like AccountingData and BookingData.
export interface AccountingData {
  fileNumber: string;
  supplierName: string;
  bookingDate: string;
  arrivalFileDate: string;
  totalIncome: number;
  totalExpenses: number;
  restProfit: number;
  currency: "USD" | "EGP";
  transactions: Array<{
    description: string;
    totalInvoice: number;
    paidAmount: number;
    restAmount: number;
    wayOfPayment: string;
    date: string;
  }>;
  extraIncoming: Array<{
    type: string;
    amount: number;
    note: string;
    status: string;
    date: string;
  }>;
  expenses: {
    accommodation: Array<{
      hotelName: string;
      totalAmount: number;
      status: string;
    }>;
    domesticFlights: Array<{
      flightDetails: string;
      cost: number;
      status: string;
    }>;
    guides: Array<{
      guideName: string;
      totalCost: number;
      date: string;
      note: string;
    }>;
    transportation: Array<{
      city: string;
      supplierName: string;
      amount: number;
      status: string;
    }>;
    entranceTickets: number;
  };
}

const generateAccountingPDFBlob = (accounting: AccountingData): Blob => {
  const doc = new jsPDF();
  const pageHeight =
    doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth =
    doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  let y = 15;

  // Set the Amiri font we added before for consistency
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFontBase64); // Assuming amiriFontBase64 is in this file or imported
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal", "UTF-8");
  doc.setFont("Amiri", "UTF-8", "UTF-8");

  // 1. Header
  doc.setFontSize(22);
  doc.setTextColor("#003366");
  doc.text("Accounting Report", pageWidth / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor("#333333");
  doc.text(`File Number: ${accounting.fileNumber}`, pageWidth / 2, y, {
    align: "center",
  });
  y += 15;

  // 2. Main Transactions Table
  doc.setFontSize(14);
  doc.text("Transactions", 14, y);
  autoTable(doc, {
    startY: y + 2,
    head: [["Description", "Total", "Paid", "Rest", "Payment", "Date"]],
    body: accounting.transactions.map((t) => [
      t.description,
      `${t.totalInvoice.toLocaleString()} ${accounting.currency}`,
      `${t.paidAmount.toLocaleString()} ${accounting.currency}`,
      `${t.restAmount.toLocaleString()} ${accounting.currency}`,
      t.wayOfPayment,
      t.date,
    ]),
    theme: "grid",
    headStyles: { fillColor: "#003366" },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // 3. Expenses Tables
  doc.setFontSize(14);
  doc.text("Expenses", 14, y);
  y += 8;

  // Accommodation Expenses
  autoTable(doc, {
    startY: y,
    head: [["Accommodation", "Total Amount", "Status"]],
    body: accounting.expenses.accommodation.map((h) => [
      h.hotelName,
      `${h.totalAmount.toLocaleString()} ${accounting.currency}`,
      h.status,
    ]),
    foot: [
      [
        "Total",
        `${accounting.expenses.accommodation
          .reduce((sum, item) => sum + item.totalAmount, 0)
          .toLocaleString()} ${accounting.currency}`,
        "",
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: "#4A5568" }, // Gray color for expenses
    footStyles: {
      fillColor: "#E2E8F0",
      textColor: "#000000",
      fontStyle: "bold",
    },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Other expenses can be added in the same way (Flights, Guides, etc.)
  // For brevity, we'll skip adding all tables, but the pattern is the same.

  // 4. Financial Summary
  doc.setFontSize(14);
  doc.text("Financial Summary", 14, y);
  y += 8;

  const summaryY = y;
  // Total Income
  doc.setFontSize(11);
  doc.setTextColor("#333");
  doc.text("Grand Total Income", 20, summaryY);
  doc.setFontSize(16);
  doc.setTextColor("#28a745"); // Green
  doc.text(
    `${accounting.totalIncome.toLocaleString()} ${accounting.currency}`,
    20,
    summaryY + 8
  );

  // Total Expenses
  doc.setFontSize(11);
  doc.setTextColor("#333");
  doc.text("Grand Total Expenses", 80, summaryY);
  doc.setFontSize(16);
  doc.setTextColor("#dc3545"); // Red
  doc.text(
    `${accounting.totalExpenses.toLocaleString()} ${accounting.currency}`,
    80,
    summaryY + 8
  );

  // Rest Profit
  doc.setFontSize(11);
  doc.setTextColor("#333");
  doc.text("Rest Profit", 140, summaryY);
  doc.setFontSize(18);
  doc.setTextColor(accounting.restProfit >= 0 ? "#28a745" : "#dc3545");
  doc.text(
    `${accounting.restProfit.toLocaleString()} ${accounting.currency}`,
    140,
    summaryY + 8
  );

  // Add footer to all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("Amiri", "UTF-8");
    doc.setFontSize(9);
    doc.setTextColor("#888888");
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }

  return doc.output("blob");
};

// ✅ EXPORTED: Functions to download and share the accounting PDF
export const downloadAccountingPDF = (accounting: AccountingData) => {
  const blob = generateAccountingPDFBlob(accounting);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Accounting-${accounting.fileNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareAccountingPDF = async (
  accounting: AccountingData,
  message: string
) => {
  const blob = generateAccountingPDFBlob(accounting);
  const filename = `Accounting-${accounting.fileNumber}.pdf`;
  const file = new File([blob], filename, { type: "application/pdf" });

  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: "Accounting Report",
      text: message,
      files: [file],
    });
  } else {
    throw new Error(
      "File sharing is not supported on this browser. Please download the PDF and share it manually."
    );
  }
};

//invoices

// In /lib/pdf-utils.ts

// 1. Add new interfaces for Invoice and Booking
// It's better to move these to a central types file in a real app
export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  title: string;
  amount: number;
  currency: "USD" | "EGP";
  dueDate: string;
  paymentMethod: "bank" | "cash" | "card";
  status: "paid" | "pending" | "cancelled";
  notes?: string;
}

export interface Booking {
  id: string;
  fileNumber: string;
  supplier: string;
  arrivalDate: string;
  departureDate: string;
  paxCount: number;
}

export const generateInvoicePDFBlob = (
  invoice: Invoice,
  relatedBooking: Booking | null
): Blob => {
  const doc = new jsPDF();
  const pageHeight =
    doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth =
    doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  let y = 20;

  // Use the Amiri font for consistency
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFontBase64);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri", "UTF-8");

  // 🎨 Header
  doc.setFontSize(22);
  doc.setFont("Amiri", "bold", "UTF-8");
  doc.setTextColor("#0d6efd"); // Blue color
  doc.text(" Book & Go Travel", 15, y);

  doc.setFontSize(9);
  doc.setFont("Amiri", "normal", "UTF-8");
  doc.setTextColor("#6c757d");
  doc.text("Phone: +20 112 263 6253", pageWidth - 15, y - 5, {
    align: "right",
  });
  doc.text("Email: info@bookandgo.com", pageWidth - 15, y, { align: "right" });
  doc.text("Cairo, Egypt", pageWidth - 15, y + 5, { align: "right" });
  y += 15;
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);
  y += 20;

  // 🎨 Invoice Title
  doc.setFontSize(32);
  doc.setFont("Amiri", "bold", "UTF-8");
  doc.setTextColor("#111827");
  doc.text("INVOICE", 15, y);

  doc.setFontSize(14);
  doc.setTextColor("#6b7280");
  doc.text(invoice.invoiceNumber, pageWidth - 15, y, { align: "right" });
  y += 15;

  // 🎨 Info Grid
  doc.setFontSize(10);
  doc.setTextColor("#6b7280");
  doc.text("INVOICE DATE", 15, y);
  doc.text("DUE DATE", 80, y);
  doc.text("STATUS", 145, y);
  y += 6;

  doc.setFontSize(12);
  doc.setFont("Amiri", "bold", "UTF-8");
  doc.setTextColor("#1f2937");
  doc.text(new Date().toLocaleDateString(), 15, y);
  doc.text(invoice.dueDate, 80, y);
  // Status Badge
  const statusColor = invoice.status === "paid" ? "#dcfce7" : "#fef3c7";
  const statusTextColor = invoice.status === "paid" ? "#166534" : "#92400e";
  doc.setFillColor(statusColor);
  doc.roundedRect(145, y - 4, 30, 7, 3, 3, "F");
  doc.setTextColor(statusTextColor);
  doc.text(invoice.status.toUpperCase(), 150, y);
  y += 20;

  // 🎨 Invoice Breakdown Table
  doc.setTextColor("#111827"); // Reset text color
  autoTable(doc, {
    startY: y,
    head: [["Description", "Category", "Quantity", "Unit Price", "Amount"]],
    body: [
      // Note: This data is hardcoded as in your JSX. You should make it dynamic from your data source.
      [
        "Hotel Accommodation - Four Seasons Cairo",
        "Accommodation",
        "7 nights",
        "$200.00",
        "$1,400.00",
      ],
      [
        "Flight Tickets - EgyptAir",
        "Transportation",
        `${relatedBooking?.paxCount || 2} pax`,
        "$450.00",
        "$900.00",
      ],
      [
        "Private Transportation",
        "Transportation",
        "7 days",
        "$80.00",
        "$560.00",
      ],
      ["Tour Guide Services", "Services", "7 days", "$60.00", "$420.00"],
      ["Entrance Fees & Activities", "Activities", "Various", "-", "$320.00"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: "#f9fafb",
      textColor: "#374151",
      fontStyle: "bold",
    },
    columnStyles: {
      4: { halign: "right" }, // Align amount column to the right
    },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.cell.section === "body") {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY;

  // 🎨 Totals
  const totalX = pageWidth - 15;
  y += 10;
  doc.setFontSize(11);
  doc.setTextColor("#333333");
  doc.text("Subtotal:", 140, y);
  doc.text("$3,600.00", totalX, y, { align: "right" });
  y += 7;
  doc.text("Tax (14%):", 140, y);
  doc.text("$504.00", totalX, y, { align: "right" });
  y += 7;
  doc.text("Service Fee:", 140, y);
  doc.text("$100.00", totalX, y, { align: "right" });
  y += 8;
  doc.setLineWidth(0.2);
  doc.line(135, y, totalX, y);
  y += 8;
  doc.setFontSize(14);
  doc.setFont("Amiri", "bold", "UTF-8");
  doc.text("Grand Total:", 135, y);
  doc.text(
    `$${invoice.amount.toLocaleString()} ${invoice.currency}`,
    totalX,
    y,
    { align: "right" }
  );

  // 🎨 Footer
  const footerY = pageHeight - 20;
  doc.setLineWidth(0.5);
  doc.line(15, footerY, pageWidth - 15, footerY);
  doc.setFontSize(10);
  doc.setTextColor("#6b7280");
  doc.text(
    "Thank you for choosing our services!",
    pageWidth / 2,
    footerY + 10,
    { align: "center" }
  );
  doc.setFont("Amiri", "bold", "UTF-8");
  doc.text("Book & Go Travel Agency", pageWidth / 2, footerY + 15, {
    align: "center",
  });

  return doc.output("blob");
};

// ✅ EXPORTED FUNCTIONS
export const downloadInvoicePDF = (
  invoice: Invoice,
  relatedBooking: Booking | null
) => {
  const blob = generateInvoicePDFBlob(invoice, relatedBooking);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareInvoicePDF = async (
  invoice: Invoice,
  relatedBooking: Booking | null,
  message: string
) => {
  const blob = generateInvoicePDFBlob(invoice, relatedBooking);
  const filename = `Invoice-${invoice.invoiceNumber}.pdf`;
  const file = new File([blob], filename, { type: "application/pdf" });

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
    throw new Error("File sharing is not supported on this browser.");
  }
};
