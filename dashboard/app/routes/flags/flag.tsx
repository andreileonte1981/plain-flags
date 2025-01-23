import Client from "~/client/client";
import type { Route } from "../../+types/root";
import FlagBadges from "./components/flagBadges";
import { Link, useRevalidator } from "react-router";
import BackIcon from "~/components/icons/backIcon";
import YesNo from "~/components/reusables/yesno";
import { useContext, useState } from "react";
import { ModalContext } from "~/context/modalContext";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const response = await Client.get(`flags/${params.flagId}`);

  return response.data;
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const details: any = loaderData;

  if (!details) {
    return <div>Error loading details</div>;
  }

  const [turnOnOffWaitOpen, setTurnOnOffWaitOpen] = useState(false);

  const [ynOpen, setYnOpen] = useState(false);

  const { showMessage } = useContext(ModalContext);

  const revalidator = useRevalidator();

  async function turnOff() {
    try {
      setTurnOnOffWaitOpen(true);

      const response = await Client.post("flags/turnoff", { id: details.id });

      setTurnOnOffWaitOpen(false);

      revalidator.revalidate();
    } catch (error: any) {
      // debugger;
      setTurnOnOffWaitOpen(false);

      showMessage(error.response?.data?.message || "Error turning feature off");
    }
  }

  async function turnOn() {
    try {
      setTurnOnOffWaitOpen(true);

      const response = await Client.post("flags/turnon", { id: details.id });

      setTurnOnOffWaitOpen(false);

      revalidator.revalidate();
    } catch (error: any) {
      // debugger;
      setTurnOnOffWaitOpen(false);

      showMessage(error.response?.data?.message || "Error turning feature on");
    }
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

        <div>
          {details.isOn && (
            <YesNo
              question="Turn feature off : are you sure?"
              onYes={() => {
                turnOff();
              }}
              isOpen={ynOpen}
              hide={() => setYnOpen(false)}
            >
              {turnOnOffWaitOpen && <div>Turning off</div>}
              {!turnOnOffWaitOpen && (
                <button
                  className="rounded bg-red-600 text-white m-2 px-2 py-1 hover:bg-red-400"
                  onClick={() => setYnOpen(true)}
                >
                  Turn off
                </button>
              )}
            </YesNo>
          )}
          {!details.isOn && (
            <YesNo
              question="Turn feature on : are you sure?"
              onYes={() => {
                turnOn();
              }}
              isOpen={ynOpen}
              hide={() => setYnOpen(false)}
            >
              {turnOnOffWaitOpen && <div>Turning on</div>}
              {!turnOnOffWaitOpen && (
                <button
                  className="rounded bg-green-600 text-white m-2 px-2 py-1 hover:bg-green-400"
                  onClick={() => setYnOpen(true)}
                >
                  Turn on
                </button>
              )}
            </YesNo>
          )}
        </div>
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
