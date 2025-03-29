import type { ReactNode } from "react";

export default function Badge(props: {
  children: ReactNode;
  text: string;
  color: string;
  tooltip: string;
}) {
  return (
    <div
      className="group relative flex items-center h-6 px-1 border-2 rounded-full m-1"
      style={{
        borderColor: props.color,
        color: props.color,
      }}
    >
      <p className="pr-1 font-bold text-sm">{props.text}</p>
      {props.children}
      <div className="absolute top-0 right-0 bottom-0 left-0 bg-current opacity-10 rounded-full"></div>
      {props.tooltip && (
        <div className="absolute invisible group-hover:visible transition-opacity duration-300 opacity-0 group-hover:opacity-100 md:w-96 w-36 p-2 my-1 bg-black/90 rounded bottom-full text-white text-sm font-bold">
          {props.tooltip}
        </div>
      )}
    </div>
  );
}
