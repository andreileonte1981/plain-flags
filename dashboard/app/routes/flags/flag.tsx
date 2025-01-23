import Client from "~/client/client";
import type { Route } from "../../+types/root";
import FlagBadges from "./components/flagBadges";
import { Link } from "react-router";
import BackIcon from "~/components/icons/backIcon";
import ButtonTurnOnOff from "./components/buttonTurnOnOff";

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
    <div className="text-gray-500 font-semibold">
      <div className="flex gap-x-10 justify-between items-center flex-wrap border-b-4 m-2">
        <Link
          className="flex items-center gap-1 m-2 text-sm text-red-500 hover:underline"
          to="/flags"
        >
          <BackIcon />
          back to flags
        </Link>

        <div className="m-2 text-lg font-bold">{details.name}</div>

        <ButtonTurnOnOff details={details} />
      </div>

      <div className="flex items-center justify-center border-b-4 pb-2 m-2">
        <FlagBadges
          isOn={details.isOn}
          stale={details.stale}
          constraints={details.constraints}
          showTips={false}
        />
      </div>
    </div>
  );
}
