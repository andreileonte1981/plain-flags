import FlagList from "~/components/flag/flaglist";
import { redirect } from "react-router";
import type { Flag } from "~/domain/flag";
import Client from "~/client/client";
import type { Route } from "../+types/root";

export async function clientLoader({}) {
  if (!localStorage.getItem("jwt")) {
    return redirect("/login");
  }

  const response = await Client.get("flags");

  return response.data;
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const flags: Flag[] | undefined = loaderData;
  return <FlagList flags={flags} />;
}
