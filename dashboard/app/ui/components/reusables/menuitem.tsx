import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";

export default function MenuItem(props: {
  children: ReactNode;
  text: string;
  linkto: string;
  tooltip: string;
}) {
  const path = useLocation();

  const isOnCurrent = path.pathname.indexOf(props.linkto) >= 0;

  const c =
    `group flex items-center justify-end m-1 hover:bg-opacity-5 w-auto` +
    ` border-r-4 ${isOnCurrent ? "border-gray-800" : ""} ${
      isOnCurrent ? "" : "border-opacity-0 border-transparent"
    }`;

  return (
    <div className={c}>
      <Link
        to={props.linkto}
        className="flex flex-row items-center justify-end gap-1 font-semibold text-gray-500 text-right hover:text-red-500"
      >
        <span className="inline">{props.text}</span>
        <div className="ml-2 mr-2 flex-none">{props.children}</div>
      </Link>
      <div className="absolute invisible group-hover:visible transition-opacity duration-300 opacity-0 group-hover:opacity-100 w-52 p-2 bg-black/90 rounded left-full text-white text-sm font-bold">
        {props.tooltip}
      </div>
    </div>
  );
}
