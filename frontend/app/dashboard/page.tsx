import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardRootPage() {
  // 1. Fetch current user
  const user = await currentUser();

  // If not logged in, redirect to sign-in
  if (!user) {
    return redirect("/sign-in");
  }

  // 2. Get the role from metadata
  // We cast it to string to safely check it
  const role = user.publicMetadata?.role as string | undefined;

  // 3. Dynamic Redirect Logic
  if (role?.toLowerCase() === "examiner") {
    redirect("/dashboard/examiner");
  } else {
    redirect("/dashboard/candidate");
  }

  // This never renders because of the redirects above
  return null;
}
