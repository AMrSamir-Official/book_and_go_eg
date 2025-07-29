import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { amiriFontBase64 } from "../amiri-font"; // Make sure this path is correct

// The BookingData interface should be identical to the one in the view page
// It's best practice to have this in a shared types file.
interface BookingData {
  id: string;
  fileNumber: string;
  vendor: string;
  paxCount: number;
  arrivalDate: string;
  departureDate: string;
  numberOfNights: number;
  nationality: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  arrivalFlight: {
    date: string;
    time: string;
    airlineName: string;
    flightNo: string;
  };
  departureFlight: {
    date: string;
    time: string;
    airlineName: string;
    flightNo: string;
  };
  domesticFlights: Array<{
    departure: string;
    arrival: string;
    date: string;
    time: string;
    airlineName: string;
    flightNo: string;
  }>;
  hotels: Array<{
    city: string;
    name: string;
    checkIn: string;
    checkOut: string;
    status: "pending" | "confirmed";
  }>;
  nileCruise: {
    name: string;
    checkIn: string;
    checkOut: string;
    status: "pending" | "confirmed";
  };
  include: string;
  exclude: string;
  specialNotice: string;
  dailyProgram: Array<{
    day: number;
    date: string;
    city: string;
    details: string;
  }>;
  cairoTransfer: {
    paxCount: number;
    vanType: string;
    driver: { name: string; contact: string; description: string };
    days: Array<{
      day: number;
      date: string;
      city: string;
      description: string;
    }>;
  };
  aswanLuxorTransfer: {
    paxCount: number;
    vanType: string;
    days: Array<{
      day: number;
      date: string;
      city: string;
      description: string;
    }>;
  };
  meetingAssist: {
    paxCount: number;
    name: string;
    driver: { name: string; contact: string };
    arrivalFlight: {
      date: string;
      time: string;
      airlineName: string;
      flightNo: string;
    };
    nationality: string;
  };
  guides: Array<{
    id: string;
    city: string;
    guideName: string;
    guestNationality: string;
    paxAdults: number;
    paxChildren: number;
    pickupHotelLocation: string;
    days: Array<{
      day: number;
      date: string;
      time: string;
      include: string;
      exclude: string;
    }>;
  }>;
}

// We need to tell TypeScript that the jsPDF instance will have the autoTable method
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// =================================================================
// --- Full Booking PDF Generation ---
// =================================================================

// --- استبدل الدالة القديمة بهذه الدالة الكاملة ---
const generatePDFBlob = (booking: BookingData): Blob => {
  const doc = new jsPDF();
  const pageHeight =
    doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth =
    doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  let y = 15;

  doc.addFileToVFS("Amiri-Regular.ttf", amiriFontBase64);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal", "UTF-8");
  doc.setFont("Amiri");

  const checkPageBreak = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - 20) {
      doc.addPage();
      y = 15;
    }
  };

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
  autoTable(doc, {
    startY: y,
    body: [
      [
        `File Number: ${booking.fileNumber}`,
        `Nationality: ${booking.nationality}`,
      ],
      [`Vendor: ${booking.vendor}`, `Arrival Date: ${booking.arrivalDate}`],
      [
        `No. of Pax: ${booking.paxCount}`,
        `Departure Date: ${booking.departureDate}`,
      ],
      ["", `No. of Nights: ${booking.numberOfNights}`],
    ],
    theme: "plain",
    styles: { font: "Amiri" },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // --- 3. Flight Details ---
  checkPageBreak(50);
  doc.setFontSize(14);
  doc.text("2. Flight Details", 14, y);
  y += 8;
  autoTable(doc, {
    startY: y,
    body: [
      [
        "Arrival:",
        `${booking.arrivalFlight.airlineName} ${booking.arrivalFlight.flightNo} - ${booking.arrivalFlight.date} @ ${booking.arrivalFlight.time}`,
      ],
      [
        "Departure:",
        `${booking.departureFlight.airlineName} ${booking.departureFlight.flightNo} - ${booking.departureFlight.date} @ ${booking.departureFlight.time}`,
      ],
    ],
    theme: "plain",
    styles: { font: "Amiri" },
  });
  y = (doc as any).lastAutoTable.finalY + 5;

  if (booking.domesticFlights.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Route", "Airline", "Date & Time"]],
      body: booking.domesticFlights.map((f) => [
        `${f.departure} → ${f.arrival}`,
        `${f.airlineName} ${f.flightNo}`,
        `${f.date} @ ${f.time}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: "#4A5568", font: "Amiri" },
      bodyStyles: { font: "Amiri" },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- 4. Accommodation ---
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.text("3. Accommodation", 14, y);
  autoTable(doc, {
    startY: y + 2,
    head: [["City", "Hotel Name", "Check-in", "Check-out", "Status"]],
    body: booking.hotels.map((h) => [
      h.city,
      h.name,
      h.checkIn,
      h.checkOut,
      h.status,
    ]),
    theme: "grid",
    headStyles: { fillColor: "#003366", font: "Amiri" },
    bodyStyles: { font: "Amiri" },
  });
  y = (doc as any).lastAutoTable.finalY;

  if (booking.nileCruise && booking.nileCruise.name) {
    y += 5;
    autoTable(doc, {
      startY: y,
      head: [["Nile Cruise", "Check-in", "Check-out", "Status"]],
      body: [
        [
          booking.nileCruise.name,
          booking.nileCruise.checkIn,
          booking.nileCruise.checkOut,
          booking.nileCruise.status,
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: "#4A5568", font: "Amiri" },
      bodyStyles: { font: "Amiri" },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- 5. Itinerary & Program ---
  checkPageBreak(80);
  doc.setFontSize(14);
  doc.text("4. Itinerary & Program", 14, y);
  y += 8;
  doc.setFontSize(10);
  let textLines = doc.splitTextToSize(
    `Include: ${booking.include || "N/A"}`,
    180
  );
  doc.text(textLines, 15, y);
  y += textLines.length * 5 + 5;
  textLines = doc.splitTextToSize(`Exclude: ${booking.exclude || "N/A"}`, 180);
  doc.text(textLines, 15, y);
  y += textLines.length * 5 + 5;
  if (booking.specialNotice) {
    textLines = doc.splitTextToSize(
      `Special Notice: ${booking.specialNotice}`,
      180
    );
    doc.text(textLines, 15, y);
    y += textLines.length * 5 + 5;
  }

  checkPageBreak(40);
  doc.setFontSize(12);
  doc.text("Daily Program", 14, y);
  autoTable(doc, {
    startY: y + 2,
    head: [["Day", "Date", "City", "Details"]],
    body: booking.dailyProgram.map((d) => [d.day, d.date, d.city, d.details]),
    theme: "striped",
    headStyles: { fillColor: "#4A5568", font: "Amiri" },
    bodyStyles: { font: "Amiri" },
    didParseCell: (data) => {
      if (data.column.index === 3) {
        data.cell.styles.cellWidth = "auto";
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // --- 6. Transportation ---
  checkPageBreak(80);
  doc.setFontSize(14);
  doc.text("5. Transportation", 14, y);
  y += 8;
  doc.setFontSize(12);
  doc.text("Cairo Transfer Order", 15, y);
  y += 6;
  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 9, font: "Amiri" },
    body: [
      [
        `Pax: ${booking.cairoTransfer.paxCount}`,
        `Van: ${booking.cairoTransfer.vanType}`,
      ],
      [
        `Driver: ${booking.cairoTransfer.driver.name}`,
        `Contact: ${booking.cairoTransfer.driver.contact}`,
      ],
      [
        {
          content: `Notes: ${booking.cairoTransfer.driver.description}`,
          colSpan: 2,
        },
      ],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 2;
  autoTable(doc, {
    startY: y,
    head: [["Day", "Date", "City", "Description"]],
    body: booking.cairoTransfer.days.map((d) => [
      d.day,
      d.date,
      d.city,
      d.description,
    ]),
    theme: "striped",
    headStyles: { fillColor: "#6b7280", font: "Amiri" },
    bodyStyles: { font: "Amiri" },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  checkPageBreak(50);
  doc.setFontSize(12);
  doc.text("Aswan/Luxor/Hurghada Transfer", 15, y);
  y += 6;
  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 9, font: "Amiri" },
    body: [
      [
        `Pax: ${booking.aswanLuxorTransfer.paxCount}`,
        `Van: ${booking.aswanLuxorTransfer.vanType}`,
      ],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 2;
  autoTable(doc, {
    startY: y,
    head: [["Day", "Date", "City", "Description"]],
    body: booking.aswanLuxorTransfer.days.map((d) => [
      d.day,
      d.date,
      d.city,
      d.description,
    ]),
    theme: "striped",
    headStyles: { fillColor: "#6b7280", font: "Amiri" },
    bodyStyles: { font: "Amiri" },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // --- 7. Guide Details ---
  checkPageBreak(50);
  doc.setFontSize(14);
  doc.text("6. Guide Details", 14, y);
  y += 8;

  booking.guides.forEach((guide) => {
    checkPageBreak(60);
    doc.setFontSize(12);
    doc.text(`${guide.city} Guide (${guide.guideName})`, 15, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      theme: "plain",
      styles: { fontSize: 9, font: "Amiri" },
      body: [
        [
          `Pax: ${guide.paxAdults} Adults, ${guide.paxChildren} Children`,
          `Nationality: ${guide.guestNationality}`,
        ],
        [{ content: `Pickup: ${guide.pickupHotelLocation}`, colSpan: 2 }],
      ],
    });
    y = (doc as any).lastAutoTable.finalY + 2;

    autoTable(doc, {
      startY: y,
      head: [["Day", "Date", "Time", "Include", "Exclude"]],
      body: guide.days.map((d) => [
        d.day,
        d.date,
        d.time,
        d.include,
        d.exclude,
      ]),
      theme: "striped",
      headStyles: { fillColor: "#6b7280", font: "Amiri" },
      bodyStyles: { font: "Amiri" },
      margin: { left: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  });

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

export const downloadBookingPDF = (booking: BookingData) => {
  try {
    const blob = generatePDFBlob(booking);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Booking-${booking.fileNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert(
      "An error occurred while generating the PDF. Please check the console."
    );
  }
};

export const shareBookingPDF = async (
  booking: BookingData,
  message: string
) => {
  const blob = generatePDFBlob(booking);
  const file = new File([blob], `Booking-${booking.fileNumber}.pdf`, {
    type: "application/pdf",
  });
  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: "Booking Details",
      text: message,
      files: [file],
    });
  } else {
    throw new Error("File sharing not supported.");
  }
};

// =================================================================
// --- Meeting & Assist PDF Generation ---
// =================================================================

const generateMeetingAssistPDFBlob = (
  meetingAssist: BookingData["meetingAssist"],
  fileNumber: string
): Blob => {
  const doc = new jsPDF();
  const pageWidth =
    doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  let y = 15;

  doc.addFileToVFS("Amiri-Regular.ttf", amiriFontBase64);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal", "UTF-8");
  doc.setFont("Amiri");

  doc.setFontSize(20);
  doc.setTextColor("#003366");
  doc.text("Meeting & Assist Service Order", pageWidth / 2, y, {
    align: "center",
  });
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor("#333333");
  doc.text(`File Number: ${fileNumber}`, pageWidth / 2, y, { align: "center" });
  y += 15;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: "#003366", font: "Amiri", textColor: "#FFFFFF" },
    bodyStyles: { font: "Amiri" },
    head: [["Item", "Details"]],
    body: [
      ["Guest Name", meetingAssist.name],
      ["Pax Count", `${meetingAssist.paxCount}`],
      ["Nationality", meetingAssist.nationality],
      [
        "Arrival Flight",
        `${meetingAssist.arrivalFlight.airlineName} ${meetingAssist.arrivalFlight.flightNo}`,
      ],
      [
        "Arrival Time",
        `${meetingAssist.arrivalFlight.date} @ ${meetingAssist.arrivalFlight.time}`,
      ],
      ["Driver Name", meetingAssist.driver.name],
      ["Driver Contact", meetingAssist.driver.contact],
    ],
  });

  return doc.output("blob");
};

export const downloadMeetingAssistPDF = (
  meetingAssist: BookingData["meetingAssist"],
  fileNumber: string
) => {
  const blob = generateMeetingAssistPDFBlob(meetingAssist, fileNumber);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `MeetingAssist-${fileNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareMeetingAssistPDF = async (
  meetingAssist: BookingData["meetingAssist"],
  fileNumber: string,
  message: string
) => {
  const blob = generateMeetingAssistPDFBlob(meetingAssist, fileNumber);
  const file = new File([blob], `MeetingAssist-${fileNumber}.pdf`, {
    type: "application/pdf",
  });
  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: "Meeting & Assist Order",
      text: message,
      files: [file],
    });
  } else {
    throw new Error("File sharing not supported.");
  }
};

// =================================================================
// --- Single Guide PDF Generation ---
// =================================================================

const generateGuidePDFBlob = (
  guide: BookingData["guides"][0],
  fileNumber: string
): Blob => {
  const doc = new jsPDF();
  const pageWidth =
    doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  let y = 15;

  doc.addFileToVFS("Amiri-Regular.ttf", amiriFontBase64);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal", "UTF-8");
  doc.setFont("Amiri");

  doc.setFontSize(20);
  doc.setTextColor("#003366");
  doc.text(`Guide Service Order - ${guide.city}`, pageWidth / 2, y, {
    align: "center",
  });
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor("#333333");
  doc.text(`File Number: ${fileNumber}`, pageWidth / 2, y, { align: "center" });
  y += 15;

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { font: "Amiri", fontSize: 10 },
    body: [
      [
        `Guide Name: ${guide.guideName}`,
        `Guest Nationality: ${guide.guestNationality}`,
      ],
      [
        `Pax Count: ${guide.paxAdults} Adults, ${guide.paxChildren} Children`,
        `Pickup: ${guide.pickupHotelLocation}`,
      ],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.text("Daily Schedule", 14, y);

  autoTable(doc, {
    startY: y + 2,
    head: [["Day", "Date", "Time", "Include", "Exclude"]],
    body: guide.days.map((d) => [d.day, d.date, d.time, d.include, d.exclude]),
    theme: "striped",
    headStyles: { fillColor: "#6b7280", font: "Amiri", textColor: "#FFFFFF" },
    bodyStyles: { font: "Amiri" },
  });

  return doc.output("blob");
};

export const downloadGuidePDF = (
  guide: BookingData["guides"][0],
  fileNumber: string
) => {
  const blob = generateGuidePDFBlob(guide, fileNumber);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Guide-${guide.city}-${fileNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareGuidePDF = async (
  guide: BookingData["guides"][0],
  fileNumber: string,
  message: string
) => {
  const blob = generateGuidePDFBlob(guide, fileNumber);
  const file = new File([blob], `Guide-${guide.city}-${fileNumber}.pdf`, {
    type: "application/pdf",
  });
  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: `Guide Order - ${guide.city}`,
      text: message,
      files: [file],
    });
  } else {
    throw new Error("File sharing not supported.");
  }
};
