import { redirect } from "react-router";

export async function clientLoader({}) {
  if (!localStorage.getItem("jwt")) {
    return redirect("/login");
  }
}

export default function Constraints() {
  return <div>Constraints</div>;
}
