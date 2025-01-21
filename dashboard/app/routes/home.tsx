import FlagList from "~/components/flag/flaglist";
import type { Route } from "./+types/home";
import { redirect } from "react-router";
import axios from "axios";
import type { Flag } from "~/domain/flag";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Plain Flags" },
    { name: "description", content: "Activate your features in production" },
  ];
}

export async function clientLoader({}) {
  if (!localStorage.getItem("jwt")) {
    return redirect("/login");
  }
  const url = "http://127.0.0.1:5000/api/flags";
  const token = localStorage.getItem("jwt");
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const flags: Flag[] | undefined = loaderData;
  return <FlagList flags={flags} />;
}
