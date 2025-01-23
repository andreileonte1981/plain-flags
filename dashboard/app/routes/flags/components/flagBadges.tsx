import ClockIcon from "~/components/icons/clockIcon";
import FlagIcon from "~/components/icons/flagIcon";
import FlagOutlineIcon from "~/components/icons/flagOutlineIcon";
import HandIcon from "~/components/icons/handIcon";
import Badge from "~/components/reusables/badge";

export default function FlagBadges(props: {
  isOn: boolean;
  stale: boolean;
  constraints: string[];
  showTips: boolean;
}) {
  return (
    <div className="flex">
      {props.isOn && (
        <Badge
          text="on"
          color="green"
          tooltip={
            props.showTips
              ? "To turn this feature off, go to its details page via the link to the right."
              : ""
          }
        >
          <FlagIcon />
        </Badge>
      )}

      {!props.isOn && (
        <Badge
          text="off"
          color="gray"
          tooltip={
            props.showTips
              ? "To turn this feature on, go to its details page via the link to the right."
              : ""
          }
        >
          <FlagOutlineIcon />
        </Badge>
      )}

      {props.stale === true && (
        <Badge
          text="!! stale !!"
          color="#aaaa00"
          tooltip={
            props.showTips
              ? "This feature flag's state was not changed for a long time. Consider making the changes it enables permanent, and archiving it."
              : ""
          }
        >
          <ClockIcon />
        </Badge>
      )}

      {props.constraints.length > 0 && (
        <Badge
          text="constrained"
          color="magenta"
          tooltip={
            props.showTips
              ? "This feature is available only to some users."
              : ""
          }
        >
          <HandIcon />
        </Badge>
      )}
    </div>
  );
}
