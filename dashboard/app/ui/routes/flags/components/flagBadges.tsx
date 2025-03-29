import ClockIcon from "~/ui/components/icons/clockIcon";
import FlagIcon from "~/ui/components/icons/flagIcon";
import FlagOutlineIcon from "~/ui/components/icons/flagOutlineIcon";
import HandIcon from "~/ui/components/icons/handIcon";
import Badge from "~/ui/components/reusables/badge";
import type Constraint from "~/domain/constraint";

export default function FlagBadges(props: {
  isOn: boolean;
  stale: boolean;
  constraints: Constraint[];
  showTips: boolean;
}) {
  return (
    <div className="flex flex-wrap">
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
              ? "This feature is available only to some users, see below."
              : ""
          }
        >
          <HandIcon />
        </Badge>
      )}
    </div>
  );
}
