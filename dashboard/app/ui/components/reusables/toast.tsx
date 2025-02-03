import type { ToastMessage } from "~/context/toastContext";
import InfoIcon from "../icons/infoIcon";
import CloseIcon from "../icons/closeIcon";

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
        {props.messages.map((msg, index) => (
          <li className="w-full" key={index}>
            <div className="flex justify-between items-center border-2 shadow-lg p-2 rounded-lg bg-white hover:text-gray-800">
              <div className="p-2">
                <InfoIcon />
              </div>
              <div className="flex-1">
                <h1 className="text-center">{msg.text}</h1>
              </div>
              <button
                onClick={() => props.removeToast(msg.id)}
                className="p-2 hover:text-red-700 active:text-red-900"
              >
                <CloseIcon />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
