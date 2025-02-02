import { useContext, useState } from "react";
import { Link, useRevalidator } from "react-router";
import Client from "~/client/client";
import UnlinkIcon from "~/ui/components/icons/unlinkIcon";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { ModalContext } from "~/context/modalContext";
import type Constraint from "~/domain/constraint";
import YesNoWrap from "~/ui/components/reusables/yesnoWrap";

export default function AppliedConstraint(props: {
  c: Constraint;
  flagId: string;
}) {
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

  const { currentConstraint, setCurrentConstraint } = useContext(
    CurrentConstraintContext
  );

  return (
    <div className="flex flex-wrap justify-between items-center border-2 rounded p-2">
      <YesNoWrap
        question={`Remove '${props.c.description}' from this feature?`}
        clickId={`removeConstraint_${props.flagId}_${props.c.id}`}
        onYes={() => {
          unlink(props.c.id, props.flagId);
        }}
      >
        {waitOpen && <div>Removing constraint...</div>}
        {!waitOpen && (
          <button
            id={`removeConstraint_${props.flagId}_${props.c.id}`}
            className="flex gap-1 items-center border-green-700 border-2 rounded-md bg-green-500/15 p-2 text-green-600 text-xs uppercase font-bold hover:text-green-900 hover:bg-green-500/5 active:scale-95"
          >
            <UnlinkIcon />
            Remove
          </button>
        )}
      </YesNoWrap>

      <div className="text-right">
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
    </div>
  );
}
