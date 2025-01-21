import Badge from "../badge";
import ClockIcon from "../icons/clockIcon";
import FlagIcon from "../icons/flagIcon";
import FlagOutlineIcon from "../icons/flagOutlineIcon";
import HandIcon from "../icons/handIcon";

export default function FlagBadges(props: {
  isOn: boolean;
  stale: boolean;
  constraints: string[];
}) {
  return (
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
  );
}
