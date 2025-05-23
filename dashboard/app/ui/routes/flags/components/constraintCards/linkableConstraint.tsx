import { useContext, useState } from "react";
import { Link, useRevalidator } from "react-router";
import Client from "~/client/client";
import LinkIcon from "~/ui/components/icons/linkIcon";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { ModalContext } from "~/context/modalContext";
import type Constraint from "~/domain/constraint";
import YesNoWrap from "~/ui/components/reusables/yesnoWrap";
import HandIcon from "~/ui/components/icons/handIcon";

export default function LinkableConstraint(props: {
  c: Constraint;
  flagId: string;
}) {
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
    <div className="flex justify-between flex-wrap items-center border-2 rounded text-left p-2 mb-2">
      <div className="break-all">
        <Link
          to="/constraints"
          onClick={() => {
            setCurrentConstraint(props.c.id);
          }}
          className="flex gap-1 items-center text-magenta-500 hover:underline"
        >
          <LinkIcon />
          {props.c.description}
        </Link>

        <h1>
          <span className="text-gray-700">For:</span> {props.c.key}
        </h1>

        <div className="break-all">
          <span className="text-gray-700">Named:</span>
          <br />
          <div className="flex flex-col">
            {props.c.values.map((v, index) => (
              <p key={`${props.c.id}_val_${index}`}>{v}</p>
            ))}
          </div>
        </div>
      </div>

      <YesNoWrap
        question={`Apply '${props.c.description}' to this feature?`}
        clickId={`addConstraint_${props.flagId}_${props.c.id}`}
        onYes={() => {
          apply(props.c.id, props.flagId);
        }}
        hint="Some users may lose access to this feature"
      >
        {waitOpen && (
          <div className="animate-bounce">Applying constraint...</div>
        )}
        {!waitOpen && (
          <button
            id={`addConstraint_${props.flagId}_${props.c.id}`}
            className="flex items-center border-magenta-500 border-2 rounded-md bg-magenta/15 p-2 text-magenta-500 text-xs uppercase font-bold hover:text-magenta hover:bg-magenta/5 active:scale-95"
          >
            Apply
            <HandIcon />
          </button>
        )}
      </YesNoWrap>
    </div>
  );
}
