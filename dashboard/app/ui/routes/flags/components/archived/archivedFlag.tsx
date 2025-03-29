import Client from "~/client/client";
import { useEffect, useState } from "react";
import ClockIcon from "~/ui/components/icons/clockIcon";
import CollapseIcon from "~/ui/components/icons/collapseIcon";
import HistoryItem from "../historyItem";
import ExpandIcon from "~/ui/components/icons/expandIcon";
import { AnimatePresence, motion } from "motion/react";
import { slideDownVariants } from "~/ui/animations/variants";

export default function ArchivedFlag(props: { id: string; name: string }) {
  const [expanded, setExpanded] = useState(false);

  const [history, setHistory] = useState();

  useEffect(() => {
    (async () => {
      const historyResp = await Client.post("history", { flagId: props.id });

      setHistory(historyResp.data);
      //   debugger;
    })();
  }, [expanded]);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[40%,40%,15%] gap-x-2 items-center">
        <div className="break-all pb-2">
          <span>{props.name}</span>
        </div>

        <div className="pb-2 break-all">
          <span>{props.id}</span>
        </div>

        {expanded ? (
          <div className="flex flex-col pb-2">
            <div
              onClick={() => setExpanded(!expanded)}
              className="flex flex-wrap items-center md:gap-2 cursor-pointer hover:text-red-500"
            >
              <ClockIcon />
              <span className="md:inline hidden">History</span>
              <CollapseIcon />
            </div>
          </div>
        ) : (
          <div
            onClick={() => setExpanded(!expanded)}
            className="flex flex-wrap items-center md:gap-2 cursor-pointer hover:text-red-500 pb-2"
          >
            <ClockIcon />
            <span className="md:inline hidden">History</span>
            <ExpandIcon />
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            variants={slideDownVariants}
            initial="hidden"
            animate="shown"
            exit="hidden"
            transition={{ duration: 0.1, ease: "easeIn" }}
          >
            <ul className="border-t-2">
              {history ? (
                (history as any[]).map((h: any, i: number) => (
                  <li
                    key={`${props.id}_${i}`}
                    className="border-b-2 my-1 mx-2 text-sm"
                  >
                    <HistoryItem
                      userEmail={h.userEmail}
                      what={h.what}
                      when={h.when}
                      constraintInfo={h.constraintInfo}
                    />
                  </li>
                ))
              ) : (
                <span>Loading</span>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      {!expanded && <div className="w-full h-0.5 bg-gray-100 mb-2"></div>}
    </div>
  );
}
