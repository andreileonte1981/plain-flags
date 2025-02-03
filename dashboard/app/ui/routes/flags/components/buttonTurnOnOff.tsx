import { useContext, useState } from "react";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import { ModalContext } from "~/context/modalContext";
import { ToastContext } from "~/context/toastContext";
import YesNoWrap from "~/ui/components/reusables/yesnoWrap";

export default function ButtonTurnOnOff(props: { details: any }) {
  const [turnOnOffWaitOpen, setTurnOnOffWaitOpen] = useState(false);
  const { showMessage } = useContext(ModalContext);
  const { queueToast } = useContext(ToastContext);

  const revalidator = useRevalidator();
  async function turnOff() {
    try {
      setTurnOnOffWaitOpen(true);

      await Client.post("flags/turnoff", {
        id: props.details.id,
      });

      setTurnOnOffWaitOpen(false);

      revalidator.revalidate();

      queueToast("Feature turned off");
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

      queueToast("Feature turned on");
    } catch (error: any) {
      // debugger;
      setTurnOnOffWaitOpen(false);

      showMessage(error.response?.data?.message || "Error turning feature on");
    }
  }

  return (
    <div>
      {props.details.isOn ? (
        <YesNoWrap
          clickId={`turnOff_${props.details.id}`}
          question="Turn feature off : are you sure?"
          onYes={() => {
            turnOff();
          }}
        >
          {turnOnOffWaitOpen ? (
            <div>Turning off</div>
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
      ) : (
        <YesNoWrap
          clickId={`turnOn_${props.details.id}`}
          question="Turn feature on : are you sure?"
          onYes={() => {
            turnOn();
          }}
        >
          {turnOnOffWaitOpen && <div>Turning on</div>}
          {!turnOnOffWaitOpen && (
            <button
              id={`turnOn_${props.details.id}`}
              className="rounded bg-green-600 text-white mx-2 px-2 py-1 hover:bg-green-400"
              onClick={() => {}}
            >
              Turn on
            </button>
          )}
        </YesNoWrap>
      )}
    </div>
  );
}
