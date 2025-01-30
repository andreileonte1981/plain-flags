import { useState, type ReactNode } from "react";
import ExpandIcon from "../icons/expandIcon";
import CollapseIcon from "../icons/collapseIcon";

export default function Expand(props: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {!expanded ? (
        <div className="flex flex-col items-stretch w-full mt-2 px-2">
          <button
            className="flex items-center justify-center gap-1 p-1 w-full border-2 border-gray-500 rounded uppercase text-xs font-extrabold hover:text-black hover:shadow active:scale-y-95"
            onClick={() => setExpanded(true)}
          >
            Show
            <ExpandIcon />
          </button>
        </div>
      ) : (
        <div className="w-full mt-2 px-2">
          <button
            className="sticky top-32 bg-white flex items-center justify-center gap-1 p-1 w-full border-2 border-gray-500 rounded uppercase text-xs font-extrabold hover:text-black hover:shadow active:scale-y-95"
            onClick={() => setExpanded(false)}
          >
            Hide
            <CollapseIcon />
          </button>
          {props.children}
        </div>
      )}
    </>
  );
}
