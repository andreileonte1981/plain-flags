import type { ToastMessage } from "~/context/toastContext";
import InfoIcon from "../icons/infoIcon";
import CloseIcon from "../icons/closeIcon";
import { AnimatePresence, motion } from "motion/react";

export default function Toast(props: {
  messages: ToastMessage[];
  removeToast: (id: string) => void;
}) {
  return (
    <div
      id="toast"
      className="z-20 fixed bottom-0 left-1/8 right-1/8 text-gray-600 font-semibold"
    >
      <ul className="w-full space-y-1">
        <AnimatePresence presenceAffectsLayout={true}>
          {props.messages.map((msg) => (
            <motion.div
              className="w-full"
              key={msg.id}
              initial={{ y: 50, height: 0 }}
              animate={{ y: 0, height: "auto" }}
              exit={{ scale: 0, originY: 1, height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex justify-between items-center border-2 border-green-700 shadow-lg p-2 rounded-lg bg-green-100/95 hover:text-gray-800">
                <div className="p-2">
                  <img
                    src="app/graphics/logo.svg"
                    alt="logo"
                    className="w-5 h-5"
                  />
                </div>
                <div className="flex-1">
                  <motion.h1
                    className="text-center"
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
                  </motion.h1>
                </div>
                <button
                  onClick={() => props.removeToast(msg.id)}
                  className="p-2 hover:text-red-700 active:text-red-900"
                >
                  <CloseIcon />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
