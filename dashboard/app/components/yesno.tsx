import type { ReactNode } from "react";

export default function YesNo(props: {
  children: ReactNode; // should take a button
  question: string;
  onYes: Function;
  isOpen: boolean;
  hide: Function;
}) {
  return (
    <div>
      {props.isOpen && (
        <div>
          <div
            className="z-40 fixed w-screen h-screen top-0 left-0 bg-black/20"
            onClick={() => props.hide()}
          >
            {/*full screen background to click on to dismiss*/}
          </div>

          <div className="relative flex flex-col border-2 border-gray-400 rounded shadow-inner m-1 p-2 min-w-48 items-center z-50 bg-white">
            <div className="text-gray-700 font-semibold">{props.question}</div>
            <div className="bg-slate-500/25 h-1 w-full rounded my-1"></div>
            <div className="flex mt-2 justify-center gap-5 w-full text-gray-700 font-semibold">
              <div
                className="rounded w-1/3 max-w-16 text-center py-1 px-3 border-green-900 border-2 cursor-pointer hover:shadow-inner hover:border-green-700 active:bg-gray-200"
                onClick={() => {
                  props.onYes();
                  props.hide();
                }}
              >
                Yes
              </div>

              <div
                className="rounded w-1/3 max-w-16 text-center py-1 px-3 border-red-900 border-2 cursor-pointer hover:shadow-inner hover:border-red-700 active:bg-gray-200"
                onClick={() => props.hide()}
              >
                No
              </div>
            </div>
          </div>
        </div>
      )}

      {!props.isOpen && <div className="py-4">{props.children}</div>}
    </div>
  );
}
