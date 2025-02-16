import { AnimatePresence, motion } from "motion/react";
import type { Flag } from "~/domain/flag";
import ArchivedFlag from "./archivedFlag";

export default function ArchivedList(props: { flags: Flag[] }) {
  const listAnim = {
    initial: { originY: 0, scaleY: 0, height: 0 },
    animate: { originY: 0, scaleY: 1, height: "auto" },
    exit: { originY: 0, scaleY: 0, height: 0, opacity: 0 },
    transition: { duration: 0.2, ease: "easeInOut" },
  };

  return (
    <div>
      <div className="p-2 text-gray-600">
        <AnimatePresence initial={false} presenceAffectsLayout={true}>
          {props.flags.map((f) => (
            <motion.div
              variants={listAnim}
              initial="initial"
              animate="animate"
              exit="exit"
              key={`name_${f.id}`}
            >
              <ArchivedFlag id={f.id} name={f.name} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
