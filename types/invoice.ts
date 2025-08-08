// in file: src/types/invoice.ts
// in file: src/types/invoice.ts
// in file: src/types/invoice.ts

export interface InvoiceTypes {
  _id: string;
  id: string;
  title: string;
  invoiceNumber: string;
  bookingId: string;
  bookingDate: string;
  fileNumber: string;
  supplierName: string;
  arrivalFileDate: string;

  // Total Invoice
  totalInvoiceAmount: number;
  totalInvoiceCurrency: "EGP" | "USD";
  totalInvoiceExchangeRate?: number;

  // Paid Amount
  paidAmount: number;
  paidAmountCurrency: "EGP" | "USD";
  paidAmountExchangeRate?: number;

  // Rest Amount (always in EGP)
  restAmount: number;

  wayOfPayment: string;
  paymentDate: string;

  // Sections
  extraIncoming: Array<{
    incomeType: string;
    amount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    note: string;
    status: "pending" | "paid";
    date: string;
  }>;
  accommodation: Array<{
    city: string;
    name: string;
    totalAmount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    paymentDate: string;
    status: "pending" | "paid";
  }>;
  nileCruises: Array<{
    name: string;
    totalAmount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    paymentDate: string;
    status: "pending" | "paid";
  }>;
  domesticFlights: Array<{
    details: string;
    cost: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    paymentDate: string;
    status: "pending" | "paid";
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
    paymentDate: string;
    status: "pending" | "paid";
  }>;
  transportation: Array<{
    city: string;
    supplierName: string;
    amount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: "pending" | "paid";
    siteCostNo: string;
    paymentDate?: string;
  }>;

  // Grand Totals
  grandTotalIncomeEGP: number;
  grandTotalExpensesEGP: number;
  restProfitEGP: number;
  totalOwedToSuppliers: number; // <-- ها هو الحقل المطلوب

  // Other Details
  dueDate: string;
  paymentMethod: string;
  status: string;
  notes: string;
  dynamicFields: Array<{ label: string; value: string }>;
}
// export interface InvoiceFormData {
//     title: string;
//     invoiceNumber: string;
//     bookingId: string;
//     bookingDate: string;
//     fileNumber: string;
//     supplierName: string;
//     arrivalFileDate: string;
//     totalInvoiceAmount: number;
//     totalInvoiceCurrency: "EGP" | "USD";
//     totalInvoiceExchangeRate?: number;
//     paidAmount: number;
//     restAmount: number;
//     restAmountCurrency: "EGP" | "USD";
//     restAmountExchangeRate?: number;
//     wayOfPayment: string;
//     paymentDate: string;
//     extraIncoming: Array<{
//       incomeType: string;
//       amount: number;
//       currency: "EGP" | "USD";
//       exchangeRate?: number;
//       note: string;
//       status: "pending" | "paid";
//       date: string;
//     }>;
//     accommodation: Array<{
//       city: string; // NEW
//       name: string;
//       totalAmount: number;
//       currency: "EGP" | "USD";
//       exchangeRate?: number;
//       paymentDate: string;
//       status: "pending" | "paid";
//     }>;
//     nileCruises: Array<{
//       name: string;
//       totalAmount: number;
//       currency: "EGP" | "USD";
//       exchangeRate?: number;
//       paymentDate: string;
//       status: "pending" | "paid";
//     }>;
//     domesticFlights: Array<{
//       details: string;
//       cost: number;
//       currency: "EGP" | "USD";
//       exchangeRate?: number;
//       paymentDate: string;
//       status: "pending" | "paid";
//     }>;
//     entranceTickets: Array<{
//       site: string;
//       cost: number;
//       no: number;
//       total: number;
//       currency: "EGP" | "USD";
//       exchangeRate?: number;
//     }>;
//     guide: Array<{
//       city: string; // NEW
//       name: string;
//       cost: number;
//       currency: "EGP" | "USD";
//       exchangeRate?: number;
//       paymentDate: string;
//       status: "pending" | "paid";
//     }>;
//     transportation: Array<{
//       city: string;
//       supplierName: string;
//       amount: number;
//       currency: "EGP" | "USD";
//       exchangeRate?: number;
//       status: "pending" | "paid";
//       siteCostNo: string;
//     }>;
//     grandTotalIncomeEGP: number;
//     grandTotalExpensesEGP: number;
//     restProfitEGP: number;
//     dueDate: string;
//     paymentMethod: string;
//     status: string;
//     notes: string;
//     dynamicFields: Array<{ label: string; value: string }>;
//   }
