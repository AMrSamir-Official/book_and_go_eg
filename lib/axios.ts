import { useAuthStore } from "@/lib/auth";
import axios from "axios";

// الرابط الأساسي للـ API الخاص بك
// تأكد من وجوده في ملف .env.local
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://45.151.142.147:5000/api";

export const createApiClient = () => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // هذا هو الجزء الأهم: "interceptor"
  // هذا الكود يعمل قبل إرسال أي طلب
  api.interceptors.request.use(
    (config) => {
      // 1. جلب التوكن الحقيقي من المخزن (zustand store)
      const token = useAuthStore.getState().token;

      // 2. إذا كان هناك توكن، قم بإضافته إلى هيدر الطلب
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config; // 3. إرسال الطلب مع التوكن
    },
    (error) => {
      // في حالة وجود خطأ، قم برفضه
      return Promise.reject(error);
    }
  );

  return api;
};
