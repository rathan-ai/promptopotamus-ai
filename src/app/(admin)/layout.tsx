import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { isAdmin, getCurrentUser } from "@/lib/auth";

// This layout protects all pages inside the (admin) group
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect('/login');
  }

  if (!(await isAdmin(supabase))) {
    redirect('/'); // Redirect non-admins to the homepage
  }

  return <>{children}</>;
}