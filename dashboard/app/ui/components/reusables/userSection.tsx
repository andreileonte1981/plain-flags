import { useState } from "react";
import UserIcon from "../icons/userIcon";
import { AnimatePresence, motion } from "motion/react";
import UserPanel from "./userPanel";

export default function UserSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="m-2 mb-0">
      <div className="-mb-4">
        <UserPanel expanded={expanded} setExpanded={setExpanded} originY={1} />
      </div>
      <div className="mb-4">
        <AnimatePresence initial={false} mode="wait">
          {!expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0 }}
              transition={{ duration: 0.2, ease: "easeIn" }}
            >
              <div
                onClick={() => {
                  setExpanded(true);
                }}
                className="flex gap-1 items-center justify-center text-gray-500 hover:text-red-500 active:text-red-800 cursor-pointer"
              >
                <div id="Me" className="font-semibold text-center">
                  Me
                </div>
                <div className="flex-none">
                  <UserIcon />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
