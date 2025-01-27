import { useContext, useState } from "react";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import LinkIcon from "~/components/icons/linkIcon";
import UnlinkIcon from "~/components/icons/unlinkIcon";
import YesNo from "~/components/reusables/yesno";
import { ModalContext } from "~/context/modalContext";
import type Constraint from "~/domain/constraint";

export default function AppliedConstraint(props: {
  c: Constraint;
  flagId: string;
}) {
  const [ynOpen, setYnOpen] = useState(false);
  const [waitOpen, setWaitOpen] = useState(false);
  const { showMessage } = useContext(ModalContext);
  const revalidator = useRevalidator();

  async function unlink(constraintId: string, flagId: string) {
    try {
      setWaitOpen(true);

      await Client.post("constraints/unlink", {
        constraintId,
        flagId,
      });

      setWaitOpen(false);

      revalidator.revalidate();
    } catch (error: any) {
      // debugger;
      setWaitOpen(false);

      showMessage(
        error.response?.data?.message || "Error removing constraint from flag"
      );
    }
  }

  return (
    <div className="flex justify-between items-center border-2 rounded p-2">
      <YesNo
        question={`Remove '${props.c.description}' from this feature?`}
        onYes={() => {
          unlink(props.c.id, props.flagId);
        }}
        isOpen={ynOpen}
        hide={() => setYnOpen(false)}
      >
        {waitOpen && <div>Removing constraint...</div>}
        {!waitOpen && (
          <button
            onClick={() => setYnOpen(true)}
            className="flex gap-1 items-center border-green-700 border-2 rounded-md bg-green-500/15 p-2 text-green-600 text-xs uppercase font-bold hover:text-green-900 hover:bg-green-500/5 active:scale-95"
          >
            <UnlinkIcon />
            Remove
          </button>
        )}
      </YesNo>

      <div className="text-right">
        <h1>{props.c.description}</h1>
        <h1>For: {props.c.key}</h1>
        <h1>Named: {props.c.values.join(", ")}</h1>
      </div>
    </div>
  );
}
