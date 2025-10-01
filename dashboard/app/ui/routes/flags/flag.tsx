import Client from "~/client/client";
import type { Route } from "../../../+types/root";
import FlagBadges from "./components/flagBadges";
import { Link, redirect } from "react-router";
import BackIcon from "~/ui/components/icons/backIcon";
import ButtonTurnOnOff from "./components/buttonTurnOnOff";
import HistoryItem from "./components/historyItem";
import ClockIcon from "~/ui/components/icons/clockIcon";
import type Constraint from "~/domain/constraint";
import ConstraintSection from "./components/constraintSection";
import { CurrentFlagContext } from "~/context/currentFlagContext";
import { useContext, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Feature Flag Details" },
    {
      name: "description",
      content: "Turn your feature on and off here, constrain it, remove it",
    },
  ];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  if (!Client.checkApiUrl()) {
    // debugger;
    return redirect("/");
  }
  if (!localStorage.getItem("jwt")) {
    return redirect("/login");
  }
  const detailsReq = Client.get(`flags/${params.flagId}`);
  const historyReq = Client.post("history", { flagId: params.flagId });
  const constraintsReq = Client.get("constraints");

  const [detailsResp, historyResp, constraintsResp] = await Promise.all([
    detailsReq,
    historyReq,
    constraintsReq,
  ]);

  return {
    details: detailsResp.data,
    history: historyResp.data,
    availableConstraints: constraintsResp.data,
  };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { details, history, availableConstraints }: any = loaderData;

  const { currentFlag, setCurrentFlag } = useContext(CurrentFlagContext);

  useEffect(() => {
    setCurrentFlag(`flagcard_${details.id}`);
  }, []);

  if (!details) {
    return <div>Error loading details</div>;
  }

  const linkableConstraints = availableConstraints.filter(
    (c: Constraint) =>
      !details.constraints.some((c2: Constraint) => c2.id === c.id)
  );

  return (
    <div className="text-gray-500 font-semibold">
      <div className="sticky md:top-0 top-12 z-10 md:h-32 h-40 bg-white flex flex-wrap gap-x-0 justify-between items-center border-b-4 m-2 mt-0">
        <div className="flex flex-wrap items-center justify-between">
          <Link
            className="hidden md:flex items-center gap-1 mx-2 text-sm text-red-500 hover:underline"
            to="/flags"
          >
            <BackIcon />
            back to flags
          </Link>

          <div className="break-all mx-2 text-lg font-bold">{details.name}</div>

          <div className="flex items-center justify-center mx-2">
            <FlagBadges
              isOn={details.isOn}
              stale={details.stale}
              constraints={details.constraints}
              showTips={false}
            />
          </div>
        </div>
        <div className="flex-none">
          <ButtonTurnOnOff details={details} />
        </div>
      </div>

      <ConstraintSection
        linkableConstraints={linkableConstraints}
        linkedConstraints={details.constraints}
        flagId={details.id}
      />

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
