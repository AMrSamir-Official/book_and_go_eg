"use client";

import { useFormStatus } from "react-dom";
import { loginAction } from "./actions"; // استيراد الـ Server Action من الملف الجديد

// استيراد المكونات التي لا تزال تحتاجها
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useActionState, useEffect, useState } from "react"; // نحتاج فقط لـ useState لإظهار/إخفاء كلمة المرور
// مكون داخلي لإظهار حالة التحميل تلقائيًا
function SubmitButton() {
  const { pending } = useFormStatus(); // هذا الـ hook يعرف متى يكون الفورم في حالة إرسال

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          جاري تسجيل الدخول...
        </>
      ) : (
        "تسجيل الدخول"
      )}
    </Button>
  );
}

export default function LoginPage() {
  // useActionState  يربط الـ Server Action بحالة المكون ويعيد الحالة الأخيرة (مثل رسالة الخطأ)
  const [state, formAction] = useActionState(loginAction, undefined);

  // لم نعد نحتاج إلا لـ state واحد لإظهار/إخفاء كلمة المرور
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.redirectTo) {
      window.location.href = state.redirectTo; // ⬅️ إعادة تحميل كاملة (حل مئة بالمئة)
    }
  }, [state?.redirectTo]);
  // تم حذف: useForm, useEffect, useRouter, useToast, useAuthStore, useState (error, isLoading)
  // لأن الـ Server Action يعالج كل هذا الآن.
  const locale = useLocale();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">B&G</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Book & Go Travel</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {/* لم نعد بحاجة لـ handleSubmit. الـ form يستدعي الـ action مباشرة */}
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            {/* عرض رسالة الخطأ القادمة من الـ Server Action */}
            {state?.message && (
              <Alert variant="destructive">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email" // <-- مهم: استخدم `name` بدلاً من `register`
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password" // <-- مهم: استخدم `name`
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <SubmitButton />
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs">
              <p>
                <strong>Admin:</strong> admin@bookandgo.com / admin123
              </p>
              <p>
                <strong>User:</strong> user@bookandgo.com / user123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
