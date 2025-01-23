import { useContext, useState } from "react";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import YesNo from "~/components/reusables/yesno";
import { ModalContext } from "~/context/modalContext";

export default function ButtonTurnOnOff(props: { details: any }) {
  const [ynOpen, setYnOpen] = useState(false);
  const [turnOnOffWaitOpen, setTurnOnOffWaitOpen] = useState(false);
  const { showMessage } = useContext(ModalContext);

  const revalidator = useRevalidator();
  async function turnOff() {
    try {
      setTurnOnOffWaitOpen(true);

      await Client.post("flags/turnoff", {
        id: props.details.id,
      });

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

      await Client.post("flags/turnon", {
        id: props.details.id,
      });

      setTurnOnOffWaitOpen(false);

      revalidator.revalidate();
    } catch (error: any) {
      // debugger;
      setTurnOnOffWaitOpen(false);

      showMessage(error.response?.data?.message || "Error turning feature on");
    }
  }

  return (
    <div>
      {props.details.isOn && (
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
      {!props.details.isOn && (
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
  );
}
