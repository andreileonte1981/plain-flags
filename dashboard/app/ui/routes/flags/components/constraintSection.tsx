import type Constraint from "~/domain/constraint";
import LinkableConstraint from "./constraintCards/linkableConstraint";
import AppliedConstraint from "./constraintCards/appliedConstraint";
import Expand from "~/ui/components/reusables/expand";
import { AnimatePresence, motion } from "motion/react";

export default function ConstraintSection(props: {
  linkableConstraints: Constraint[];
  linkedConstraints: Constraint[];
  flagId: string;
}) {
  const listAnim = {
    initial: { scaleY: 0, height: 0 },
    animate: { originY: 0, scaleY: 1, height: "auto" },
    exit: { originY: 0, scaleY: 0, height: 0, opacity: 0 },
    transition: { duration: 0.2, ease: "easeInOut" },
  };
  return (
    <div className="flex gap-1 m-2 border-b-4 pb-2">
      <div className="flex flex-col items-center w-1/2 text-center border-r-2 pr-1">
        <h1>Available constraints</h1>

        <Expand>
          <ul className="py-2">
            <AnimatePresence initial={false}>
              {props.linkableConstraints.map((c: Constraint) => (
                <motion.li
                  key={`available_${c.id}`}
                  variants={listAnim}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <LinkableConstraint c={c} flagId={props.flagId} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Expand>
      </div>

      <div className="w-1/2 text-center">
        Applied constraints
        <ul className="p-2">
          <AnimatePresence initial={false}>
            {props.linkedConstraints.map((c: Constraint) => (
              <motion.li
                key={`applied_${c.id}`}
                variants={listAnim}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <AppliedConstraint c={c} flagId={props.flagId} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
