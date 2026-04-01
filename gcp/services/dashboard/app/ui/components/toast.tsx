import { AnimatePresence, motion } from "motion/react";
import type { ToastMessage } from "~/context/toastContext";

export default function Toast(props: {
  messages: ToastMessage[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="z-50 fixed bottom-0 left-4 right-4 sm:left-1/4 sm:right-1/4 text-gray-600 font-semibold pointer-events-none">
      <ul className="w-full space-y-1">
        <AnimatePresence presenceAffectsLayout={true}>
          {props.messages.map((msg) => (
            <motion.div
              className="w-full pointer-events-auto"
              key={msg.id}
              initial={{ y: 50, height: 0 }}
              animate={{ y: 0, height: "auto" }}
              exit={{ scale: 0, originY: 1, height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex justify-between items-center border-2 border-green-700 shadow-lg p-2 rounded-lg bg-green-100/95">
                <div className="p-2 shrink-0">
                  <img src="/images/logo.svg" alt="" className="w-5 h-5" />
                </div>
                <motion.p
                  className="flex-1 text-center text-sm"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    bounce: 1,
                    damping: 25,
                    stiffness: 200,
                    mass: 3,
                  }}
                >
                  {msg.text}
                </motion.p>
                <button
                  onClick={() => props.removeToast(msg.id)}
                  className="p-2 text-gray-400 hover:text-red-700 active:text-red-900 shrink-0"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
