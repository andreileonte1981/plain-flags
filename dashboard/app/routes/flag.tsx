import Client from "~/client/client";
import type { Route } from "../+types/root";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const response = await Client.get(`flags/${params.flagId}`);

  return response.data;
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const details: any = loaderData;

  if (!details) {
    return <div>Error loading details</div>;
  }

  return (
    <div>
      <div>Flag details</div>
      <div>{details.name}</div>
    </div>
  );
}
