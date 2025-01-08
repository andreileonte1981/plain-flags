import { redirect } from "react-router";

export async function clientLoader({}) {
  // TODO: check logged in; wrap all routes except login and register in a component that redirects to login
  if (!localStorage.getItem("jwt")) {
    return redirect("/login");
  }
}

export default function Constraints() {
  return <div>Constraints</div>;
}
