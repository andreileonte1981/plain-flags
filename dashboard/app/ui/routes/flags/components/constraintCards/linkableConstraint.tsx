import { useContext, useState } from "react";
import { Link, useRevalidator } from "react-router";
import Client from "~/client/client";
import LinkIcon from "~/ui/components/icons/linkIcon";
import YesNo from "~/ui/components/reusables/yesno";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { ModalContext } from "~/context/modalContext";
import type Constraint from "~/domain/constraint";

export default function LinkableConstraint(props: {
  c: Constraint;
  flagId: string;
}) {
  const [ynOpen, setYnOpen] = useState(false);
  const [waitOpen, setWaitOpen] = useState(false);
  const { showMessage } = useContext(ModalContext);
  const revalidator = useRevalidator();

  async function apply(constraintId: string, flagId: string) {
    try {
      setWaitOpen(true);

      await Client.post("constraints/link", {
        constraintId,
        flagId,
      });

      setWaitOpen(false);

      revalidator.revalidate();
    } catch (error: any) {
      // debugger;
      setWaitOpen(false);

      showMessage(
        error.response?.data?.message || "Error applying constraint to flag"
      );
    }
  }

  const { currentConstraint, setCurrentConstraint } = useContext(
    CurrentConstraintContext
  );

  return (
    <div className="flex justify-between flex-wrap items-center border-2 rounded text-left p-2">
      <div>
        <Link
          to="/constraints"
          onClick={() => {
            setCurrentConstraint(props.c.id);
          }}
          className="text-magenta-500 hover:underline"
        >
          {props.c.description}
        </Link>
        <h1>For: {props.c.key}</h1>
        <h1>Named: {props.c.values.join(", ")}</h1>
      </div>

      <YesNo
        question={`Apply '${props.c.description}' to this feature?`}
        onYes={() => {
          apply(props.c.id, props.flagId);
        }}
        isOpen={ynOpen}
        hide={() => setYnOpen(false)}
      >
        {waitOpen && <div>Applying constraint...</div>}
        {!waitOpen && (
          <button
            onClick={() => setYnOpen(true)}
            className="flex items-center border-magenta-500 border-2 rounded-md bg-magenta/15 p-2 text-magenta-500 text-xs uppercase font-bold hover:text-magenta hover:bg-magenta/5 active:scale-95"
          >
            Apply
            <LinkIcon />
          </button>
        )}
      </YesNo>
    </div>
  );
}
