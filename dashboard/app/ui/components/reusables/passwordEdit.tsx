import { useState, type ChangeEventHandler } from "react";
import LocalError from "./localError";

export default function PasswordEdit(props: {
  handleChange: ChangeEventHandler;
  defaultValue: string;
  id: string;
  placeholder: string;
  error: string;
  autofocus?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col relative">
      <input
        className="my-2 p-2 border-2 text-gray-600 text-sm rounded focus:border-current focus:ring-0 font-semibold placeholder-gray-400"
        type={showPassword ? "text" : "password"}
        name={props.id}
        id={props.id}
        autoComplete="off"
        placeholder={props.placeholder}
        onChange={props.handleChange}
        required
        autoFocus={props.autofocus}
        defaultValue={props.defaultValue}
      />
      <div
        className="absolute right-1 mt-5 mr-0 bg-white pl-2 cursor-default text-gray-400 hover:text-gray-700"
        onMouseEnter={() => setShowPassword(true)}
        onMouseLeave={() => setShowPassword(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-4"
        >
          <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
          <path
            fillRule="evenodd"
            d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <LocalError error={props.error} />
    </div>
  );
}
