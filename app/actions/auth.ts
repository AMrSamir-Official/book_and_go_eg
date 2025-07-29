// app/actions/auth.ts

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  // Delete the cookie from the server side
  (await cookies()).delete("token");

  // Redirect the user to the login page
  redirect("/login");
}
