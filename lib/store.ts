import { BookingFormData } from "@/app/[locale]/bookings/new/page";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AppState {
  theme: "light" | "dark" | "system";
  locale: "en" | "ar";
  sidebarCollapsed: boolean;
  isHydrated: boolean;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setLocale: (locale: "en" | "ar") => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setHydrated: () => void;
}

interface DueEntry {
  id: string;
  type: "owed_to_me" | "i_owe";
  amount: number;
  currency: "USD" | "EGP";
  person: string;
  description: string;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  createdAt: string;
}

interface DuesState {
  entries: DueEntry[];
  addEntry: (entry: Omit<DueEntry, "id" | "createdAt">) => void;
  updateEntry: (id: string, updates: Partial<DueEntry>) => void;
  deleteEntry: (id: string) => void;
  markAsPaid: (id: string) => void;
  getTotalOwedToMe: () => number;
  getTotalIOwe: () => number;
}

// App Store - Theme and Language are completely independent
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "system",
      locale: "en",
      sidebarCollapsed: true,
      isHydrated: false,
      setTheme: (theme) => {
        set({ theme });
        // Apply theme immediately without affecting locale
        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          if (theme === "system") {
            const systemTheme = window.matchMedia(
              "(prefers-color-scheme: dark)"
            ).matches
              ? "dark"
              : "light";
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }
          // Set cookie for SSR
          document.cookie = `theme=${theme}; path=/; max-age=31536000`;
        }
      },
      setLocale: (locale) => {
        set({ locale });
        // Apply locale immediately without affecting theme
        if (typeof window !== "undefined") {
          document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
          document.documentElement.lang = locale;
          // Set cookie for SSR
          document.cookie = `locale=${locale}; path=/; max-age=31536000`;

          const { theme } = get();
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          if (theme === "system") {
            const systemTheme = window.matchMedia(
              "(prefers-color-scheme: dark)"
            ).matches
              ? "dark"
              : "light";
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }
        }
      },
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== "undefined") {
          const { theme, locale } = state;

          // Apply theme independently
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          if (theme === "system") {
            const systemTheme = window.matchMedia(
              "(prefers-color-scheme: dark)"
            ).matches
              ? "dark"
              : "light";
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }

          // Apply locale independently
          document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
          document.documentElement.lang = locale;

          state.setHydrated();
        }
      },
    }
  )
);
//when make booking
interface BookingFormState {
  data: BookingFormData | null;
  setBookingData: (data: BookingFormData) => void;
  clearBookingData: () => void;
}

export const useBookingFormStore = create<BookingFormState>()(
  persist(
    (set) => ({
      data: null,
      setBookingData: (data) => set({ data }),
      clearBookingData: () => set({ data: null }),
    }),
    {
      name: "booking-form-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        data: state.data,
      }),
    }
  )
);
// Dues & Settlements Store
export const useDuesStore = create<DuesState>()(
  persist(
    (set, get) => ({
      entries: [
        {
          id: "1",
          type: "owed_to_me",
          amount: 2500,
          currency: "USD",
          person: "Ahmed Hassan",
          description: "Tour guide services - Cairo trip",
          dueDate: "2024-01-22",
          status: "pending",
          createdAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          type: "i_owe",
          amount: 1800,
          currency: "USD",
          person: "Four Seasons Hotel",
          description: "Hotel accommodation - 3 nights",
          dueDate: "2024-01-25",
          status: "pending",
          createdAt: "2024-01-16T14:30:00Z",
        },
        {
          id: "3",
          type: "owed_to_me",
          amount: 850,
          currency: "USD",
          person: "Sarah Johnson",
          description: "Transportation services",
          dueDate: "2024-01-20",
          status: "paid",
          createdAt: "2024-01-10T09:15:00Z",
        },
        {
          id: "4",
          type: "i_owe",
          amount: 3200,
          currency: "USD",
          person: "Nile Cruise Company",
          description: "Cruise booking - 4 nights",
          dueDate: "2024-01-18",
          status: "overdue",
          createdAt: "2024-01-08T16:20:00Z",
        },
      ],
      addEntry: (entry) => {
        const newEntry = {
          ...entry,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));
      },
      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));
      },
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },
      markAsPaid: (id) => {
        const { updateEntry } = get();
        updateEntry(id, { status: "paid" });
      },
      getTotalOwedToMe: () => {
        const { entries } = get();
        return entries
          .filter(
            (entry) => entry.type === "owed_to_me" && entry.status === "pending"
          )
          .reduce((total, entry) => total + entry.amount, 0);
      },
      getTotalIOwe: () => {
        const { entries } = get();
        return entries
          .filter(
            (entry) => entry.type === "i_owe" && entry.status === "pending"
          )
          .reduce((total, entry) => total + entry.amount, 0);
      },
    }),
    {
      name: "dues-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
