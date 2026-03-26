import { redirect } from "react-router";
import { getFirebaseAuth } from "~/firebase";

export async function clientLoader() {
  const auth = getFirebaseAuth();
  if (auth.currentUser) {
    return redirect("/flags");
  }
  return redirect("/login");
}

export default function Index() {
  return null;
}
