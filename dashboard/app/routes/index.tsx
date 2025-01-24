import { redirect } from "react-router";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Plain Flags" },
    { name: "description", content: "Activate your features in production" },
  ];
}

export async function clientLoader({}) {
  return redirect("/flags");
}

export default function Component({ loaderData }: Route.ComponentProps) {
  return <></>;
}
