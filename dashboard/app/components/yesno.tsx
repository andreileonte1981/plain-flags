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
            className="z-10 absolute w-screen h-screen top-0 left-0 bg-black/20"
            onClick={() => props.hide()}
          >
            {/*full screen background to click on to dismiss*/}
          </div>

          <div className="relative flex flex-col border-2 border-gray-400 rounded shadow-inner m-1 p-2 items-center z-20 bg-white">
            <div className="text-gray-700 font-semibold z-20">
              {props.question}
            </div>
            <div className="bg-slate-500/25 h-1 w-full rounded my-1 z-20"></div>
            <div className="flex mt-2 justify-around w-full text-gray-700 font-semibold z-20">
              <div
                className="rounded w-1/3 text-center py-1 px-3 border-green-900 border-2 cursor-pointer hover:shadow-inner hover:border-green-700 active:bg-gray-200 z-20"
                onClick={() => {
                  props.onYes();
                  props.hide();
                }}
              >
                Yes
              </div>
              <div
                className="rounded w-1/3 text-center py-1 px-3 border-red-900 border-2 cursor-pointer hover:shadow-inner hover:border-red-700 active:bg-gray-200 z-20"
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
