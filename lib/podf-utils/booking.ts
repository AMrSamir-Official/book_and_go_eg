import { BookingTypes } from "@/types/bookingData";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { amiriFontBase64 } from "../amiri-font";
import { logoBase64 } from "./logo";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// =================================================================
// --- Full Booking PDF Generation ---
// =================================================================
const generatePDFBlob = (booking: BookingTypes): Blob => {
  const doc = new jsPDF();
  const pageHeight =
    doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth =
    doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

  doc.addImage(logoBase64, "PNG", 15, 10, 50, 15);
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

  doc.setFontSize(14);
  doc.text("1. Basic Booking Information", 14, y);
  y += 8;
  const basicInfoBody = [
    [
      `File Number: ${booking.fileNumber}`,
      `Nationality: ${booking.nationality}`,
    ],
    [`Vendor: ${booking.vendor}`, `Arrival Date: ${booking.arrivalDate}`],
    [`Adults: ${booking.paxCount}`, `Departure Date: ${booking.departureDate}`],
    [
      `Children: ${booking.childCount || 0}`,
      `No. of Nights: ${booking.numberOfNights}`,
    ],
  ];
  autoTable(doc, {
    startY: y,
    body: basicInfoBody,
    theme: "plain",
    styles: { font: "Amiri" },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  if (booking.guests && booking.guests.length > 0) {
    checkPageBreak(40);
    doc.setFontSize(14);
    doc.text("2. Guest Information", 14, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [["#", "Title", "First Name", "Last Name", "Type"]],
      body: booking.guests.map(
        (guest: NonNullable<BookingTypes["guests"]>[0], index: number) => [
          index + 1,
          guest.title,
          guest.firstName,
          guest.lastName,
          guest.type,
        ]
      ),
      theme: "striped",
      headStyles: { fillColor: "#003366", font: "Amiri" },
      bodyStyles: { font: "Amiri" },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (booking.meetingAssist && booking.meetingAssist.name) {
    checkPageBreak(60);
    doc.setFontSize(14);
    doc.setTextColor("#1e40af");
    doc.text("3. Meeting & Assist Details", 14, y);
    y += 8;
    const meetingAssistBody = [
      ["Guest Name", booking.meetingAssist.name],
      [
        "Pax Count",
        `${booking.meetingAssist.paxAdults || 0} Adults, ${
          booking.meetingAssist.paxChildren || 0
        } Children`,
      ],
      ["Nationality", booking.meetingAssist.nationality],
      [
        "Arrival Flight",
        `${booking.meetingAssist.arrivalFlight.airlineName} ${booking.meetingAssist.arrivalFlight.flightNo}`,
      ],
      [
        "Arrival Time",
        `${booking.meetingAssist.arrivalFlight.date} @ ${booking.meetingAssist.arrivalFlight.time}`,
      ],
      ["Assigned Driver", booking.meetingAssist.driver.name],
      ["Driver Contact", booking.meetingAssist.driver.contact],
    ];
    if (booking.meetingAssist.note) {
      meetingAssistBody.push(["Note", booking.meetingAssist.note]);
    }
    autoTable(doc, {
      startY: y,
      theme: "grid",
      headStyles: { fillColor: "#1e40af", font: "Amiri", textColor: "#FFFFFF" },
      bodyStyles: { font: "Amiri" },
      head: [["Item", "Details"]],
      body: meetingAssistBody,
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  checkPageBreak(50);
  doc.setFontSize(14);
  doc.text("4. Flight Details", 14, y);
  y += 8;
  autoTable(doc, {
    startY: y,
    body: [
      [
        `Arrival:`,
        `${booking.arrivalFlight.airlineName} ${booking.arrivalFlight.flightNo} - ${booking.arrivalFlight.date} @ ${booking.arrivalFlight.time}`,
      ],
      [
        `Departure:`,
        `${booking.departureFlight.airlineName} ${booking.departureFlight.flightNo} - ${booking.departureFlight.date} @ ${booking.departureFlight.time}`,
      ],
    ],
    theme: "plain",
    styles: { font: "Amiri" },
  });
  y = (doc as any).lastAutoTable.finalY + 5;
  if (booking.domesticFlights && booking.domesticFlights.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Route", "Airline", "Date & Time"]],
      body: booking.domesticFlights.map(
        (f: NonNullable<BookingTypes["domesticFlights"]>[0]) => [
          `${f.departure} → ${f.arrival}`,
          `${f.airlineName} ${f.flightNo}`,
          `${f.date} @ ${f.time}`,
        ]
      ),
      theme: "striped",
      headStyles: { fillColor: "#4A5568", font: "Amiri" },
      bodyStyles: { font: "Amiri" },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  checkPageBreak(40);
  doc.setFontSize(14);
  doc.text("5. Accommodation", 14, y);
  y += 8;
  autoTable(doc, {
    startY: y,
    head: [["City", "Hotel Name", "Check-in", "Check-out", "Status"]],
    body: booking.hotels.map((h: NonNullable<BookingTypes["hotels"]>[0]) => [
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
  y = (doc as any).lastAutoTable.finalY + 10;
  if (booking.nileCruise && booking.nileCruise.name) {
    checkPageBreak(40);
    doc.setFontSize(12);
    doc.text("Nile Cruise", 14, y);
    y += 8;
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

  checkPageBreak(80);
  doc.setFontSize(14);
  doc.text("6. Itinerary & Program", 14, y);
  y += 8;
  doc.setFontSize(10);
  let textLines = doc.splitTextToSize(
    `Include: ${booking.include || "N/A"}`,
    180
  );
  doc.text(textLines, 15, y);
  y += textLines.length * 4 + 5;
  textLines = doc.splitTextToSize(`Exclude: ${booking.exclude || "N/A"}`, 180);
  doc.text(textLines, 15, y);
  y += textLines.length * 4 + 5;
  if (booking.specialNotice) {
    textLines = doc.splitTextToSize(
      `Special Notice: ${booking.specialNotice}`,
      180
    );
    doc.text(textLines, 15, y);
    y += textLines.length * 4 + 5;
  }

  checkPageBreak(40);
  doc.setFontSize(12);
  doc.text("Daily Program", 14, y);
  y += 8;
  autoTable(doc, {
    startY: y,
    head: [["Day", "Date", "City", "Details"]],
    body: booking.dailyProgram.map(
      (d: NonNullable<BookingTypes["dailyProgram"]>[0]) => [
        d.day,
        d.date,
        d.city,
        d.details,
      ]
    ),
    theme: "striped",
    headStyles: { fillColor: "#4A5568", font: "Amiri" },
    bodyStyles: { font: "Amiri" },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  checkPageBreak(80);
  doc.setFontSize(14);
  doc.text("7. Transportation", 14, y);
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
    ] as any,
  });
  y = (doc as any).lastAutoTable.finalY + 2;
  autoTable(doc, {
    startY: y,
    head: [["Day", "Date", "City", "Description"]],
    body: booking.cairoTransfer.days.map(
      (d: NonNullable<BookingTypes["cairoTransfer"]["days"]>[0]) => [
        d.day,
        d.date,
        d.city,
        d.description,
      ]
    ),
    theme: "striped",
    headStyles: { fillColor: "#6b7280", font: "Amiri" },
    bodyStyles: { font: "Amiri" },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  checkPageBreak(50);
  doc.setFontSize(12);
  doc.text("Aswan & Luxor & Hurghada Transfer", 15, y);
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
    body: booking.aswanLuxorTransfer.days.map(
      (d: NonNullable<BookingTypes["aswanLuxorTransfer"]["days"]>[0]) => [
        d.day,
        d.date,
        d.city,
        d.description,
      ]
    ),
    theme: "striped",
    headStyles: { fillColor: "#6b7280", font: "Amiri" },
    bodyStyles: { font: "Amiri" },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  if (booking.guides && booking.guides.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.text("8. Guide Details", 14, y);
    y += 8;
    booking.guides.forEach((guide: NonNullable<BookingTypes["guides"]>[0]) => {
      checkPageBreak(60);
      doc.setFontSize(12);
      doc.text(`${guide.city} Guide (${guide.guideName})`, 15, y);
      y += 6;
      const guideInfoBody = [
        [
          `Pax: ${guide.paxAdults} Adults, ${guide.paxChildren} Children`,
          `Nationality: ${guide.guestNationality}`,
        ],
        [{ content: `Pickup: ${guide.pickupHotelLocation}`, colSpan: 2 }],
      ];
      if (guide.note) {
        guideInfoBody.push([{ content: `Note: ${guide.note}`, colSpan: 2 }]);
      }
      autoTable(doc, {
        startY: y,
        theme: "plain",
        styles: { fontSize: 9, font: "Amiri" },
        body: guideInfoBody as any,
      });
      y = (doc as any).lastAutoTable.finalY + 2;

      autoTable(doc, {
        startY: y,
        head: [["Day", "Date", "Time", "Include", "Exclude"]],
        body: guide.days.map(
          (d: NonNullable<BookingTypes["guides"]>[0]["days"][0]) => [
            d.day,
            d.date,
            d.time,
            d.include,
            d.exclude,
          ]
        ),
        theme: "striped",
        headStyles: { fillColor: "#6b7280", font: "Amiri" },
        bodyStyles: { font: "Amiri" },
        margin: { left: 15 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    });
  }

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

export const downloadBookingPDF = (booking: BookingTypes) => {
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
  booking: BookingTypes,
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

const generateMeetingAssistPDFBlob = (
  meetingAssist: BookingTypes["meetingAssist"],
  fileNumber: string
): Blob => {
  const doc = new jsPDF();
  const pageWidth =
    doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  doc.addImage(logoBase64, "PNG", 15, 10, 50, 15);
  let y = 35;

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

  const bodyData = [
    ["Guest Name", meetingAssist.name],
    [
      "Pax Count",
      `${meetingAssist.paxAdults || 0} Adults, ${
        meetingAssist.paxChildren || 0
      } Children`,
    ],
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
  ];
  if (meetingAssist.note) {
    bodyData.push(["Note", meetingAssist.note]);
  }

  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: "#003366", font: "Amiri", textColor: "#FFFFFF" },
    bodyStyles: { font: "Amiri" },
    head: [["Item", "Details"]],
    body: bodyData,
  });

  return doc.output("blob");
};

export const downloadMeetingAssistPDF = (
  meetingAssist: BookingTypes["meetingAssist"],
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
  meetingAssist: BookingTypes["meetingAssist"],
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

const generateGuidePDFBlob = (
  guide: BookingTypes["guides"][0],
  fileNumber: string
): Blob => {
  const doc = new jsPDF();
  const pageWidth =
    doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  doc.addImage(logoBase64, "PNG", 15, 10, 50, 15);
  let y = 35;

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

  const guideInfoBody = [
    [
      `Guide Name: ${guide.guideName}`,
      `Guest Nationality: ${guide.guestNationality}`,
    ],
    [
      `Pax Count: ${guide.paxAdults} Adults, ${guide.paxChildren} Children`,
      `Pickup: ${guide.pickupHotelLocation}`,
    ],
  ];
  if (guide.note) {
    // @ts-ignore
    guideInfoBody.push([{ content: `Note: ${guide.note}`, colSpan: 2 }]);
  }

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { font: "Amiri", fontSize: 10 },
    body: guideInfoBody as any,
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.text("Daily Schedule", 14, y);
  y += 8;
  autoTable(doc, {
    startY: y,
    head: [["Day", "Date", "Time", "Include", "Exclude"]],
    body: guide.days.map(
      (d: NonNullable<BookingTypes["guides"]>[0]["days"][0]) => [
        d.day,
        d.date,
        d.time,
        d.include,
        d.exclude,
      ]
    ),
    theme: "striped",
    headStyles: { fillColor: "#6b7280", font: "Amiri", textColor: "#FFFFFF" },
    bodyStyles: { font: "Amiri" },
  });

  return doc.output("blob");
};

export const downloadGuidePDF = (
  guide: BookingTypes["guides"][0],
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
  guide: BookingTypes["guides"][0],
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

interface TransferData {
  paxCount: number;
  vanType: string;
  driver?: { name: string; contact: string; description?: string };
  days: Array<{
    day: number;
    date: string;
    city: string;
    description: string;
  }>;
}

const generateTransferPDFBlob = (
  transferData: TransferData,
  title: string,
  fileNumber: string
): Blob => {
  const doc = new jsPDF();
  const pageWidth =
    doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  doc.addImage(logoBase64, "PNG", 15, 10, 50, 15);
  let y = 45;

  doc.addFileToVFS("Amiri-Regular.ttf", amiriFontBase64);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal", "UTF-8");
  doc.setFont("Amiri");

  // 1. Header
  doc.setFontSize(20);
  doc.setTextColor("#003366");
  doc.text(title, pageWidth / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor("#333333");
  doc.text(`File Number: ${fileNumber}`, pageWidth / 2, y, { align: "center" });
  y += 15;

  // 2. Basic Info
  const basicInfoBody = [
    [
      `Pax Count: ${transferData.paxCount}`,
      `Van Type: ${transferData.vanType}`,
    ],
  ];
  if (transferData.driver) {
    basicInfoBody.push([
      `Driver Name: ${transferData.driver.name}`,
      `Driver Contact: ${transferData.driver.contact}`,
    ]);
    if (transferData.driver.description) {
      basicInfoBody.push([
        // @ts-ignore
        {
          content: `Description: ${transferData.driver.description}`,
          colSpan: 2,
        },
      ]);
    }
  }

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { font: "Amiri", fontSize: 10 },
    body: basicInfoBody as any,
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // 3. Daily Schedule
  doc.setFontSize(12);
  doc.text("Daily Schedule", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Day", "Date", "City", "Description"]],
    body: transferData.days.map((d) => [d.day, d.date, d.city, d.description]),
    theme: "striped",
    headStyles: { fillColor: "#6b7280", font: "Amiri", textColor: "#FFFFFF" },
    bodyStyles: { font: "Amiri" },
  });

  return doc.output("blob");
};

// --- Cairo Transfer ---
export const downloadCairoTransferPDF = (booking: BookingTypes) => {
  const blob = generateTransferPDFBlob(
    booking.cairoTransfer,
    "Cairo Transfer Service Order",
    booking.fileNumber
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `CairoTransfer-${booking.fileNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareCairoTransferPDF = async (
  booking: BookingTypes,
  message: string
) => {
  const blob = generateTransferPDFBlob(
    booking.cairoTransfer,
    "Cairo Transfer Service Order",
    booking.fileNumber
  );
  const file = new File([blob], `CairoTransfer-${booking.fileNumber}.pdf`, {
    type: "application/pdf",
  });
  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: "Cairo Transfer Order",
      text: message,
      files: [file],
    });
  } else {
    throw new Error("File sharing not supported.");
  }
};

// --- Aswan/Luxor Transfer ---
export const downloadAswanLuxorTransferPDF = (booking: BookingTypes) => {
  const blob = generateTransferPDFBlob(
    booking.aswanLuxorTransfer,
    "Aswan/Luxor/Hurghada Transfer Order",
    booking.fileNumber
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `AswanLuxorTransfer-${booking.fileNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareAswanLuxorTransferPDF = async (
  booking: BookingTypes,
  message: string
) => {
  const blob = generateTransferPDFBlob(
    booking.aswanLuxorTransfer,
    "Aswan/Luxor/Hurghada Transfer Order",
    booking.fileNumber
  );
  const file = new File(
    [blob],
    `AswanLuxorTransfer-${booking.fileNumber}.pdf`,
    { type: "application/pdf" }
  );
  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: "Aswan/Luxor Transfer Order",
      text: message,
      files: [file],
    });
  } else {
    throw new Error("File sharing not supported.");
  }
};
