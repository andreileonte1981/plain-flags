import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";

export default function MenuItem(props: {
  children: ReactNode;
  text: string;
  linkto: string;
}) {
  const path = useLocation();

  const isOnCurrent = path.pathname === props.linkto;

  const c =
    `flex items-center justify-center m-1 hover:bg-gray-100 hover: bg-opacity-5 w-auto` +
    ` border-r-4 ${isOnCurrent ? "border-gray-800" : ""} ${
      isOnCurrent ? "" : "border-opacity-0 border-transparent"
    }`;

  return (
    <div className={c}>
      <Link
        to={props.linkto}
        className="flex-auto font-semibold text-gray-500 text-right hover:text-red-500"
      >
        {props.text}
      </Link>
      <div className="ml-2 mr-2 flex-none">{props.children}</div>
    </div>
  );
}
