import { AnimatePresence, motion } from "motion/react";
import { slideDownVariants } from "~/ui/animations/variants";

export default function LocalError(props: { error: string }) {
  return (
    <AnimatePresence>
      {props.error && (
        <motion.div
          className="w-full"
          variants={slideDownVariants}
          initial="hidden"
          animate="shown"
          exit="hidden"
          transition={{ duration: 0.1, ease: "easeIn" }}
        >
          <div className="w-full rounded px-2 text-center bg-red-300/30 text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6 inline-block mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            {props.error}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
