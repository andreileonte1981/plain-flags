import type { ToastMessage } from "~/context/toastContext";

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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="size-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-center">{msg.text}</h1>
              </div>
              <button
                onClick={() => props.removeToast(msg.id)}
                className="p-2 hover:text-red-700 active:text-red-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="size-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 0L8 9.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.72a.75.75 0 0 1 0 1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
