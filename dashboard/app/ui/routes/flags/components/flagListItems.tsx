import type { Flag } from "~/domain/flag";
import FlagCard from "./flagCard";
import { AnimatePresence, motion } from "motion/react";

export default function FlagListItems(flagData?: Flag[]) {
  if (!flagData?.length) {
    return (
      <div className="flex items-center justify-center">
        <h1 className="text-gray-400 my-10">No flags found</h1>
      </div>
    );
  }

  return (
    <AnimatePresence initial={false} presenceAffectsLayout={true}>
      {flagData.map((f) => (
        <motion.li
          key={f.id}
          initial={{ scaleY: 0, height: 0 }}
          animate={{ scaleY: 1, height: "auto" }}
          exit={{ scaleY: 0, height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <FlagCard
            id={f.id}
            name={f.name}
            isOn={f.isOn}
            stale={f.stale}
            constraints={f.constraints}
          />
        </motion.li>
      ))}
    </AnimatePresence>
  );
}
