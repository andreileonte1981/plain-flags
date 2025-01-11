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
          className="text-red-600 hover:underline font-semibold flex items-center"
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
        </Link>
      </div>
      <div className="flex">
        {props.isOn && (
          <Badge text="on" color="green">
            <FlagIcon />
          </Badge>
        )}
        {!props.isOn && (
          <Badge text="off" color="gray">
            <FlagOutlineIcon />
          </Badge>
        )}
        {props.stale === true && (
          <Badge text="!! stale !!" color="#aaaa00">
            <ClockIcon />
          </Badge>
        )}
        {props.constraints.length > 0 && (
          <Badge text="constrained" color="magenta">
            <HandIcon />
          </Badge>
        )}
      </div>
    </div>
  );
}
