import { Link } from "react-router";
import Badge from "../badge";
import FlagIcon from "../icons/flagIcon";
import HandIcon from "../icons/handIcon";
import ClockIcon from "../icons/clockIcon";
import FlagOutlineIcon from "../icons/flagOutlineIcon";

export default function FlagCard(props: {
  id: string;
  name: string;
  isOn: boolean;
  stale: boolean;
  constraints: string[];
}) {
  return (
    <div className="border rounded border-gray-300 shadow m-2 p-2 text-gray-500">
      <div className="flex justify-between border-b-2 border-gray-100 mb-2">
        <h1 className="my-2 font-bold">{props.name}</h1>
        <Link
          to="#"
          className="relative group text-red-600 hover:underline font-semibold flex items-center"
        >
          {props.id}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-4 ml-1"
          >
            <path
              fillRule="evenodd"
              d="M15 8A7 7 0 1 0 1 8a7 7 0 0 0 14 0ZM4.75 7.25a.75.75 0 0 0 0 1.5h4.69L8.22 9.97a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 0 0-1.06 1.06l1.22 1.22H4.75Z"
              clipRule="evenodd"
            />
          </svg>
          <div className="absolute invisible group-hover:visible p-2 bg-black/90 rounded top-full text-white text-sm font-bold z-50">
            Flag details
          </div>
        </Link>
      </div>
      <div className="flex">
        {props.isOn && (
          <Badge
            text="on"
            color="green"
            tooltip="To turn this feature off, go to its details page via the link to the right."
          >
            <FlagIcon />
          </Badge>
        )}
        {!props.isOn && (
          <Badge
            text="off"
            color="gray"
            tooltip="To turn this feature on, go to its details page via the link to the right."
          >
            <FlagOutlineIcon />
          </Badge>
        )}
        {props.stale === true && (
          <Badge
            text="!! stale !!"
            color="#aaaa00"
            tooltip="This feature flag's state was not changed for a long time. Consider making the changes it enables permanent, and archiving it."
          >
            <ClockIcon />
          </Badge>
        )}
        {props.constraints.length > 0 && (
          <Badge
            text="constrained"
            color="magenta"
            tooltip="This feature is available only to some users."
          >
            <HandIcon />
          </Badge>
        )}
      </div>
    </div>
  );
}
