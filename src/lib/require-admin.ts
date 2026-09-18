import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";

export async function requireAdmin() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}
