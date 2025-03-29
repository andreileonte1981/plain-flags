import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import InfoIcon from "../icons/infoIcon";

export default function YesNoWrap(props: {
  children: ReactNode;
  clickId: string;
  question: string;
  onYes: Function;
  hint?: string;

  /**
   * The yes/no question panel will not show if this function returns false.
   *
   * When passing a validation function, also specify a key for this component that changes with
   * the validation data in the parent state, if it's the case.
   */
  preDialogValidator?: () => boolean;

  id?: string;
}) {
  const [isOpen, setOpen] = useState(false);

  const [childrenShown, setChildrenShown] = useState(true);

  function handleClick() {
    if (props.preDialogValidator) {
      if (!props.preDialogValidator()) {
        return;
      }
    }
    setOpen(true);
  }

  const animDuration = 0.1;

  useEffect(() => {
    const el = document.getElementById(props.clickId);

    /**
     * Watch this bug
     */
    // if (!el) {
    //   console.log(
    //     `failed to add event listener, no element ${props.clickId} found`
    //   );
    // }

    el?.addEventListener("click", handleClick);

    return () => {
      el?.removeEventListener("click", handleClick);
    };
  }, [childrenShown]);

  const fade = {
    hidden: {
      opacity: 0,
      transition: {
        duration: animDuration,
        ease: "easeIn",
      },
    },
    shown: {
      opacity: 1,
      transition: {
        duration: animDuration,
        ease: "easeIn",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: animDuration,
        ease: "easeIn",
      },
    },
  };

  return (
    <AnimatePresence
      initial={false}
      mode="wait"
      onExitComplete={() => {
        setTimeout(() => {
          setChildrenShown(!isOpen);
        }, 2500 * animDuration);
      }}
    >
      {isOpen ? (
        <div
          key="yesNoPanel"
          className="z-40"
          id={`yn_${props.id}`}
          onAnimationStart={() => {
            const element = document.getElementById(`yn_${props.id}`);
            if (element) {
              element.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
              });
            }
          }}
        >
          <motion.div
            variants={fade}
            initial="hidden"
            animate="shown"
            exit="hidden"
            className="z-40 fixed w-screen h-screen top-0 left-0 bg-black/20"
            onClick={() => {
              setOpen(false);
            }}
          >
            {/*full screen background to click on to dismiss*/}
          </motion.div>

          <motion.div
            initial={{ scale: 0, height: 0, opacity: 0 }}
            animate={{ originY: 0, scale: 1, height: "auto", opacity: 1 }}
            exit={{ scale: 0, height: 0, opacity: 0 }}
            transition={{ duration: animDuration, type: "spring" }}
          >
            <div className="relative flex flex-col border-2 border-gray-400 rounded shadow-inner m-1 p-2 min-w-44 items-center z-50 bg-white">
              <div className="break-all text-gray-700 font-semibold text-center">
                {props.question}
              </div>

              <div className="bg-slate-500/25 h-1 w-full rounded my-1"></div>

              {props.hint && (
                <div className="w-full">
                  <div className="break-all flex gap-2 justify-center items-center">
                    <InfoIcon />

                    <div className="text-gray-500 text-sm font-semibold py-2">
                      {props.hint}
                    </div>
                  </div>

                  <div className="bg-slate-500/25 h-1 w-full rounded my-1"></div>
                </div>
              )}

              <div className="flex mt-2 justify-center gap-5 w-full text-gray-700 font-semibold">
                <div
                  className="break-normal rounded w-1/3 max-w-16 text-center py-1 px-3 border-green-900 border-2 cursor-pointer hover:shadow-inner hover:border-green-700 active:bg-gray-200"
                  onClick={() => {
                    setTimeout(() => {
                      props.onYes();
                    }, animDuration * 1000);
                    setOpen(false);
                  }}
                >
                  Yes
                </div>

                <div
                  className="break-normal rounded w-1/3 max-w-16 text-center py-1 px-3 border-red-900 border-2 cursor-pointer hover:shadow-inner hover:border-red-700 active:bg-gray-200"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  No
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          key="childWrapper"
          variants={fade}
          initial="hidden"
          animate="shown"
          exit="hidden"
          id="childWrap"
        >
          {props.children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
