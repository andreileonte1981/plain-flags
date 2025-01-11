import type { ReactNode } from "react";

export default function Badge(props: {
  children: ReactNode;
  text: string;
  color: string;
}) {
  return (
    <div
      className="relative flex items-center px-2 border-2 rounded-full m-1"
      style={{
        borderColor: props.color,
        color: props.color,
      }}
    >
      <p className="pr-1 font-bold">{props.text}</p>
      {props.children}
      <div className="absolute top-0 right-0 bottom-0 left-0 bg-current opacity-10 rounded-full"></div>
    </div>
  );
}
