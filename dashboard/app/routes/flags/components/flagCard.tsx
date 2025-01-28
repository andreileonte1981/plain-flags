import { Link, useRevalidator } from "react-router";
import { useContext, useState } from "react";
import FlagBadges from "./flagBadges";
import { ModalContext } from "~/context/modalContext";
import Client from "~/client/client";
import LinkIcon from "~/components/icons/linkIcon";
import YesNo from "~/components/reusables/yesno";
import TrashIcon from "~/components/icons/trashIcon";
import type Constraint from "~/domain/constraint";
import HandIcon from "~/components/icons/handIcon";
import { CurrentFlagContext } from "~/context/currentFlagContext";
import FlagIcon from "~/components/icons/flagIcon";
import scrollToElement from "../../../utils/scrollToElement";

export default function FlagCard(props: {
  id: string;
  name: string;
  isOn: boolean;
  stale: boolean;
  constraints: Constraint[];
}) {
  const [archiveYNOpen, setArchiveYNOpen] = useState(false);
  const ynElementId = `yn${props.id}`;

  const [archiveWaitOpen, setArchiveWaitOpen] = useState(false);

  const { showMessage } = useContext(ModalContext);

  const revalidator = useRevalidator();

  async function archiveFlag() {
    try {
      setArchiveWaitOpen(true);

      const response = await Client.post("flags/archive", { id: props.id });

      setArchiveWaitOpen(false);

      setCurrentFlag("");

      revalidator.revalidate();

      showMessage("Flag archived.");
    } catch (error: any) {
      // debugger;
      setArchiveWaitOpen(false);

      showMessage(error.response?.data?.message || "Flag archive error");
    }
  }

  const flagId = `flagcard_${props.id}`;

  const { currentFlag, setCurrentFlag } = useContext(CurrentFlagContext);

  const cn = `rounded border-2 m-2 p-2 text-gray-500 scroll-mt-48 ${
    flagId === currentFlag ? "border-gray-700" : "bg-gray-50 border-gray-300"
  }`;

  return (
    <div
      id={flagId}
      className={cn}
      onClick={() => {
        setCurrentFlag(flagId);
        scrollToElement(`flagcard_${props.id}`);
      }}
    >
      <div className="flex justify-between border-b-2 border-gray-100 mb-2">
        <h1 className="my-2 font-bold text-gray-700 text-lg flex items-center gap-1">
          {flagId === currentFlag && <FlagIcon />}
          {props.name}
        </h1>

        <Link
          to={`./${props.id}`}
          className="relative group text-red-600 hover:underline font-semibold flex items-center"
        >
          {props.id}
          <LinkIcon />
          <div className="absolute invisible group-hover:visible p-2 bg-black/90 rounded top-full text-white text-sm font-bold z-40">
            Flag details
          </div>
        </Link>
      </div>

      <div className="flex justify-between items-end">
        <FlagBadges
          isOn={props.isOn}
          stale={props.stale}
          constraints={props.constraints}
          showTips={true}
        />

        <YesNo
          question={`Archive '${props.name}'?`}
          onYes={() => {
            archiveFlag();
          }}
          isOpen={archiveYNOpen}
          hide={() => {
            setArchiveYNOpen(false);
          }}
          id={ynElementId}
        >
          {archiveWaitOpen && <div>Archiving...</div>}
          {!archiveWaitOpen && (
            <div
              className="border-2 border-gray-500 rounded p-1 -my-3 font-bold hover:bg-gray-600 hover:text-white active:scale-95"
              onClick={() => {
                setArchiveYNOpen(true);

                setTimeout(() => {
                  const element = document.getElementById(ynElementId);
                  if (element) {
                    element.scrollIntoView({
                      block: "nearest",
                      behavior: "smooth",
                    });
                  }
                }, 0);
              }}
            >
              <TrashIcon />
            </div>
          )}
        </YesNo>
      </div>

      {props.constraints.length > 0 && (
        <div className="mt-2 font-semibold">
          <ul className="border-2 rounded border-magenta/15 p-2 space-y-2">
            {props.constraints.map((constraint, index) => (
              <li
                className="first:border-none border-t-2 border-magenta/15 pt-1 first:pt-0"
                key={index}
              >
                <div className="flex items-center gap-1 mb-2 text-magenta-500">
                  <HandIcon />
                  <h1>{constraint.description}</h1>
                </div>

                <h1>
                  For: <span className="font-bold">{constraint.key}</span>
                </h1>

                <h1>
                  Named:{" "}
                  <span className="font-bold">
                    {constraint.values.join(", ")}
                  </span>
                </h1>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
