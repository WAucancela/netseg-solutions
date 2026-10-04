"use server";

import { redirect } from "next/navigation";
import { destroySessionCookie } from "@/lib/auth";

export async function cerrarSesion() {
  await destroySessionCookie();
  redirect("/admin/login");
}
