import { useContext, useState } from "react";
import { Link, useRevalidator } from "react-router";
import Client from "~/client/client";
import FlagIcon from "~/ui/components/icons/flagIcon";
import FlagOutlineIcon from "~/ui/components/icons/flagOutlineIcon";
import HandIcon from "~/ui/components/icons/handIcon";
import LinkIcon from "~/ui/components/icons/linkIcon";
import TrashIcon from "~/ui/components/icons/trashIcon";
import Badge from "~/ui/components/reusables/badge";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { ModalContext } from "~/context/modalContext";
import type { Flag } from "~/domain/flag";
import YesNoWrap from "~/ui/components/reusables/yesnoWrap";
import { ToastContext } from "~/context/toastContext";
import { scrollToElement } from "~/utils/scrollTo";

export default function ConstraintCard(props: {
  id: string;
  description: string;
  constraintkey: string;
  values: string[];
  flags: Flag[];
}) {
  const ynElementId = `yn${props.id}`;

  const [deleteWaitOpen, setDeleteWaitOpen] = useState(false);

  const { showMessage } = useContext(ModalContext);
  const { queueToast } = useContext(ToastContext);

  const revalidator = useRevalidator();

  async function deleteConstraint() {
    try {
      setDeleteWaitOpen(true);

      await Client.post("constraints/delete", {
        id: props.id,
      });

      setDeleteWaitOpen(false);

      revalidator.revalidate();

      queueToast("Constraint deleted.");
    } catch (error: any) {
      // debugger;
      setDeleteWaitOpen(false);

      showMessage(error.response?.data?.message || "Constraint deletion error");
    }
  }

  function mayDelete(): boolean {
    return !props.flags.some((f) => f.isOn);
  }

  const { currentConstraint, setCurrentConstraint } = useContext(
    CurrentConstraintContext
  );

  const className = `border-4 rounded-lg mx-2 mb-4 p-2 text-gray-500 font-semibold ${
    currentConstraint === props.id
      ? "border-magenta/50"
      : "border-magenta/15 bg-gray-200/25"
  }`;

  return (
    <div
      id={`constraintcard_${props.id}`}
      className={className}
      onClick={() => {
        setCurrentConstraint(props.id);
        scrollToElement(`constraintcard_${props.id}`);
      }}
    >
      <div className="flex justify-between my-2 border-b">
        <div className="flex items-center gap-2">
          <HandIcon />
          <div className="font-bold text-gray-700">{props.description}</div>
        </div>
        <div className="text-xs text-gray-400">id: {props.id}</div>
      </div>

      <div className="flex justify-between">
        <div>
          <div className="my-2">
            For:{" "}
            <span className="font-bold text-gray-700">
              {props.constraintkey}
            </span>
          </div>

          <div>
            Named:{" "}
            <span className="font-bold text-gray-700">
              {props.values.join(", ")}
            </span>
          </div>
        </div>

        <YesNoWrap
          clickId={`ynDeleteConstraint_${props.id}`}
          question={`Delete constraint?`}
          onYes={() => {
            deleteConstraint();
          }}
          id={ynElementId}
        >
          {mayDelete() ? (
            <>
              {deleteWaitOpen && (
                <div className="animate-bounce">Deleting...</div>
              )}
              {!deleteWaitOpen && (
                <div
                  className="border-2 border-gray-500 rounded p-1 font-bold hover:bg-gray-600 hover:text-white active:scale-95"
                  id={`ynDeleteConstraint_${props.id}`}
                >
                  <TrashIcon />
                </div>
              )}
            </>
          ) : (
            <div className="relative group border-2 border-gray-200 text-gray-200 rounded p-1 font-bold cursor-not-allowed">
              <TrashIcon />

              <div className="absolute invisible group-hover:visible transition-opacity duration-300 opacity-0 group-hover:opacity-100 p-2 m-1 bg-black/90 rounded top-full -left-64 text-white text-sm font-bold">
                Constrains active flags, can't delete.
                <br />
                Unlink constraint from flag first
              </div>
            </div>
          )}
        </YesNoWrap>
      </div>

      {props.flags.length > 0 && (
        <div className="bg-gray-500/5 shadow-inner rounded p-2 mt-2">
          <div className="m-2">Flags constrained:</div>

          <ul>
            {props.flags.map((f) => {
              const cn = `m-2 ${f.isOn ? "text-green-700" : "text-gray-600"}`;
              return (
                <li key={f.id} className={cn}>
                  <Link
                    className="relative group inline-flex items-center gap-1 hover:text-red-600"
                    to={`/flags/${f.id}`}
                  >
                    <LinkIcon />
                    <div className="group-hover:underline">{f.name}</div>
                    {f.isOn && (
                      <Badge text="on" color="green" tooltip="">
                        <FlagIcon />
                      </Badge>
                    )}

                    {!f.isOn && (
                      <Badge text="off" color="gray" tooltip="">
                        <FlagOutlineIcon />
                      </Badge>
                    )}
                    <div className="absolute invisible group-hover:visible transition-opacity duration-300 opacity-0 group-hover:opacity-100 p-2 bg-black/90 rounded top-full text-white text-sm font-bold z-5">
                      Flag details
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
