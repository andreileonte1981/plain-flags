import type { ReactNode } from "react";

export default function SubtleButton(props: {
  children?: ReactNode;
  onClick: Function;
  text: string;
  id?: string;
}) {
  return (
    <div
      id={props.id}
      onClick={() => props.onClick()}
      className="hover:bg-gray-300 active:bg-gray-200 border-gray-400 ml-5 mr-5 text-center rounded cursor-pointer text-gray-600 hover:text-red-800"
    >
      <div className="flex gap-1 justify-center items-center">
        <span className="font-semibold uppercase text-sm">{props.text}</span>
        {props.children}
      </div>
    </div>
  );
}
