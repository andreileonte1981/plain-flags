import FlagList from "~/components/flaglist";
import type { Route } from "./+types/home";
import { redirect } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Plain Flags" },
    { name: "description", content: "Activate your features in production" },
  ];
}

export async function clientLoader({}) {
  // TODO: check logged in; wrap all routes except login and register in a component that redirects to login
  if (!localStorage.getItem("jwt")) {
    return redirect("login");
  }
}

export default function Home() {
  return <FlagList />;
}
