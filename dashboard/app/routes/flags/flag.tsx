import Client from "~/client/client";
import type { Route } from "../../+types/root";
import FlagBadges from "./components/flagBadges";
import { Link } from "react-router";
import BackIcon from "~/components/icons/backIcon";
import ButtonTurnOnOff from "./components/buttonTurnOnOff";
import HistoryItem from "./components/historyItem";
import ClockIcon from "~/components/icons/clockIcon";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const detailsReq = Client.get(`flags/${params.flagId}`);
  const historyReq = Client.post("history", { flagId: params.flagId });

  const [detailsResp, historyResp] = await Promise.all([
    detailsReq,
    historyReq,
  ]);

  return { details: detailsResp.data, history: historyResp.data };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { details, history }: any = loaderData;

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

      <div>
        <div className="flex gap-1 items-center m-2 font-bold border-b-2">
          <ClockIcon />
          Feature History
        </div>
        <ul>
          {history.map((h: any, i: number) => (
            <li key={i} className="border-b-2 my-1 mx-2 text-sm">
              <HistoryItem
                userEmail={h.userEmail}
                what={h.what}
                when={h.when}
                constraintInfo={h.constraintInfo}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
