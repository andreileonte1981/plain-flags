import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useLocation } from "react-router";
import ErrorIcon from "../icons/errorIcon";
import type { ModalIconType } from "~/context/modalContext";
import InfoIcon from "../icons/infoIcon";

export default function Modal(props: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  message: string;
  setMessage: (val: string) => void;
  iconType: ModalIconType;
}) {
  const location = useLocation();

  useEffect(() => {
    // Close the modal when the route changes
    if (props.isOpen) {
      props.setIsOpen(false);
    }
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      {props.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1, ease: "easeIn" }}
          id="modalBackdrop"
          className="fixed flex items-center justify-center top-0 h-screen w-screen z-50 bg-black/80"
          onClick={(e) => {
            props.setIsOpen(false);
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            id="modalWindow"
            className="flex-0 flex flex-col items-center justify-around rounded bg-slate-100 md:w-1/2 md:h-1/4 w-11/12 h-1/3"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="py-5 px-7 flex gap-1 justify-center items-start">
              <div className="py-0.5">
                {props.iconType === "error" && <ErrorIcon />}
                {props.iconType === "info" && (
                  <span className="text-green-600">
                    <InfoIcon />
                  </span>
                )}
              </div>
              <h1 className="text-center text-lg font-semibold text-gray-600">
                {props.message}
              </h1>
            </div>
            <button
              className="bg-gray-500 rounded-lg px-4 hover:bg-gray-200 hover:text-gray-700 hover:shadow-inner py-2 text-white font-semibold text-lg active:bg-gray-300 active:text-gray-700"
              onClick={() => {
                props.setIsOpen(false);
              }}
              autoFocus
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
