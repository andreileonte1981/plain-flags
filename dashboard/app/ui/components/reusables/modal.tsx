import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useLocation } from "react-router";
import ErrorIcon from "../icons/infoIcon copy";

export default function Modal(props: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  message: string;
  setMessage: (val: string) => void;
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
            className="flex-0 flex flex-col items-center justify-around rounded bg-slate-100 w-1/2 h-1/4"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="px-5 flex justify-center items-center">
              <ErrorIcon />
              <h1 className="text-center text-lg py-5 px-2 font-semibold text-gray-600">
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
