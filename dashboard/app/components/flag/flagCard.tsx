import { Link } from "react-router";
import TrashIcon from "../icons/trashIcon";
import YesNo from "../reusables/yesno";
import { useContext, useState } from "react";
import FlagBadges from "./flagBadges";
import LinkIcon from "../icons/linkIcon";
import axios from "axios";
import { ModalContext } from "~/context/modalContext";

export default function FlagCard(props: {
  id: string;
  name: string;
  isOn: boolean;
  stale: boolean;
  constraints: string[];
}) {
  const [archiveYNOpen, setArchiveYNOpen] = useState(false);
  const ynElementId = `yn${props.id}`;

  const [archiveWaitOpen, setArchiveWaitOpen] = useState(false);

  const { showMessage } = useContext(ModalContext);

  async function archiveFlag() {
    try {
      const url = "http://127.0.0.1:5000/api/flags/archive";
      const token = localStorage.getItem("jwt");

      setArchiveWaitOpen(true);

      const response = await axios.post(
        url,
        { id: props.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setArchiveWaitOpen(false);

        showMessage("Flag archived.");
      }
    } catch (error: any) {
      // debugger;
      setArchiveWaitOpen(false);

      showMessage(error.response?.data?.message || "Flag creation error");
    }
  }

  return (
    <div className="border-2 rounded border-gray-300 m-2 p-2 text-gray-500">
      <div className="flex justify-between border-b-2 border-gray-100 mb-2">
        <h1 className="my-2 font-bold">{props.name}</h1>
        <Link
          to="#"
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
                  console.debug(element?.id);
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
    </div>
  );
}
