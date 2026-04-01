import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import ExpandIcon from "~/ui/icons/expandIcon";
import CollapseIcon from "~/ui/icons/collapseIcon";

export default function Expand({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {!shown ? (
        <div className="relative flex flex-col items-stretch w-full mt-2 px-2">
          <button
            className="flex items-center justify-center gap-1 p-1 w-full border-2 border-gray-500 rounded uppercase text-xs font-extrabold hover:text-black hover:shadow active:scale-y-95"
            onClick={() => {
              setExpanded(true);
              setShown(true);
            }}
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
          <AnimatePresence onExitComplete={() => setShown(false)}>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
