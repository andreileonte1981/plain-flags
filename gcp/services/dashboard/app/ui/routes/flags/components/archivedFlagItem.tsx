import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getApiClient, type HistoryEntry } from "~/client/api-client";
import ClockIcon from "~/ui/icons/clockIcon";
import ExpandIcon from "~/ui/icons/expandIcon";
import CollapseIcon from "~/ui/icons/collapseIcon";
import HistoryItem from "./historyItem";

export default function ArchivedFlagItem({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!expanded && history === null) {
      setLoading(true);
      try {
        const entries = await getApiClient().getHistory(id);
        setHistory(entries);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }
    setExpanded((e) => !e);
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[40%,40%,15%] gap-x-2 items-center py-3">
        <span className="font-bold text-gray-800 break-all">{name}</span>
        <span className="font-mono text-xs text-gray-400 break-all">{id}</span>
        <button
          onClick={toggle}
          className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
          title={expanded ? "Hide history" : "Show history"}
        >
          <ClockIcon />
          <span className="hidden sm:inline text-xs font-semibold">
            History
          </span>
          {expanded ? <CollapseIcon /> : <ExpandIcon />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="border-t-2 border-gray-100">
              {loading ? (
                <li className="py-2 text-xs text-gray-400">Loading…</li>
              ) : history && history.length > 0 ? (
                history.map((h, i) => (
                  <li
                    key={`${id}_${i}`}
                    className="border-b-2 border-gray-100 my-1 mx-2 text-sm"
                  >
                    <HistoryItem {...h} />
                  </li>
                ))
              ) : (
                <li className="py-2 text-xs text-gray-400">
                  No history found.
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
