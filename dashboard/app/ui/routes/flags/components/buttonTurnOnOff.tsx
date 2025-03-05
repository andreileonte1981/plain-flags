import { useContext, useState } from "react";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import { ModalContext } from "~/context/modalContext";
import { ToastContext } from "~/context/toastContext";
import type { Flag } from "~/domain/flag";
import YesNoWrap from "~/ui/components/reusables/yesnoWrap";

export default function ButtonTurnOnOff(props: { details: Flag }) {
  const [turnOnWaitOpen, setTurnOnWaitOpen] = useState(false);
  const [turnOffWaitOpen, setTurnOffWaitOpen] = useState(false);

  const { showMessage } = useContext(ModalContext);
  const { queueToast } = useContext(ToastContext);

  const revalidator = useRevalidator();

  async function turnOff() {
    try {
      setTurnOffWaitOpen(true);

      await Client.post("flags/turnoff", {
        id: props.details.id,
      });

      setTurnOffWaitOpen(false);

      revalidator.revalidate();

      queueToast("Feature turned off");
    } catch (error: any) {
      // debugger;
      setTurnOffWaitOpen(false);

      showMessage(error.response?.data?.message || "Error turning feature off");
    }
  }

  async function turnOn() {
    try {
      setTurnOnWaitOpen(true);

      await Client.post("flags/turnon", {
        id: props.details.id,
      });

      setTurnOnWaitOpen(false);

      revalidator.revalidate();

      queueToast("Feature turned on");
    } catch (error: any) {
      // debugger;
      setTurnOnWaitOpen(false);

      showMessage(error.response?.data?.message || "Error turning feature on");
    }
  }

  const onClass = props.details.isOn ? "hidden" : "";
  const offClass = props.details.isOn ? "" : "hidden";

  return (
    <div>
      <div className={offClass}>
        <YesNoWrap
          clickId={`turnOff_${props.details.id}`}
          question="Turn feature off : are you sure?"
          onYes={() => {
            turnOff();
          }}
        >
          {turnOffWaitOpen ? (
            <div className="animate-bounce">Turning off</div>
          ) : (
            <button
              id={`turnOff_${props.details.id}`}
              className="rounded bg-red-600 text-white mx-2 px-2 py-1 hover:bg-red-400"
              onClick={() => {}}
            >
              Turn off
            </button>
          )}
        </YesNoWrap>
      </div>

      <div className={onClass}>
        <YesNoWrap
          clickId={`turnOn_${props.details.id}`}
          question="Turn feature on : are you sure?"
          onYes={() => {
            turnOn();
          }}
        >
          {turnOnWaitOpen ? (
            <div className="animate-bounce">Turning on</div>
          ) : (
            <button
              id={`turnOn_${props.details.id}`}
              className="rounded bg-green-600 text-white mx-2 px-2 py-1 hover:bg-green-400"
              onClick={() => {}}
            >
              Turn on
            </button>
          )}
        </YesNoWrap>
      </div>
    </div>
  );
}
