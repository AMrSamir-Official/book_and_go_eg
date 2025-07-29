// In your fake-data.ts file

// ... other exports

export const sampleInvoices = [
    {
        id: "inv-001", // Make sure this ID matches what you are testing
        title: "Egypt Tour Package - Smith Family",
        invoiceNumber: "INV-2025-140",
        bookingId: "booking-001",
        bookingDate: "2025-07-02",
        fileNumber: "BG-2025-620",
        supplierName: "Egypt Travel Co.",
        arrivalFileDate: "2025-08-16",
        totalInvoiceAmount: 200,
        totalInvoiceCurrency: "USD",
        totalInvoiceExchangeRate: 50,
        paidAmount: 150,
        restAmount: 2500, // This will be displayed from the object now
        restAmountCurrency: "EGP",
        wayOfPayment: "Bank",
        paymentDate: "2025-07-08",
        extraIncoming: [
            {
                type: "Hotel extension",
                amount: 200,
                currency: "EGP",
                note: "no any note",
                status: "pending",
                date: "2025-07-31",
            },
            {
                type: "Tipping",
                amount: 200,
                currency: "EGP",
                note: "no more",
                status: "pending",
                date: "2025-08-14",
            },
        ],
        accommodation: [
            {
                name: "Four Seasons Hotel",
                totalAmount: 150,
                currency: "USD",
                exchangeRate: 50,
                paymentDate: "2025-08-14",
                status: "pending",
            },
        ],
        domesticFlights: [
            {
                details: "Cairo to Luxor Flight",
                cost: 200,
                currency: "EGP",
                paymentDate: "2025-08-30",
                status: "pending",
            },
        ],
        entranceTickets: [
            {
                site: "Pyramids of Giza",
                cost: 100,
                no: 2,
                total: 200,
                currency: "EGP",
            },
        ],
        guide: [
            {
                name: "Ahmed Ali",
                cost: 149.99,
                currency: "EGP",
                paymentDate: "2025-08-02",
                status: "pending",
            },
        ],
        transportation: [
            {
                city: "Cairo",
                supplierName: "Cairo Limo",
                amount: 200,
                currency: "EGP",
                status: "pending",
                siteCostNo: "an-1984",
                guides: [
                    {
                        guideNumber: "Driver Mohamed",
                        date: "2025-08-09",
                        note: "Airport Pickup",
                        totalCost: 156,
                    },
                ],
            },
        ],
        grandTotalIncomeEGP: 10400,
        grandTotalExpensesEGP: 8455.99,
        restProfitEGP: 1944.01,
        dueDate: "2025-08-08",
        paymentMethod: "bank",
        status: "pending",
        notes: "Please confirm all bookings before arrival.",
    },
];