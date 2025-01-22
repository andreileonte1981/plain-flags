import type { Route } from "../+types/root";

export async function loader({ params }: Route.LoaderArgs) {}

export default function Component({ loaderData }: Route.ComponentProps) {
  return <div>Flag details</div>;
}
