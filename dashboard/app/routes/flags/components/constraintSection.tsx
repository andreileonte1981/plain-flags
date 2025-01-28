import type Constraint from "~/domain/constraint";
import LinkableConstraint from "./constraintCards/linkableConstraint";
import AppliedConstraint from "./constraintCards/appliedConstraint";
import { useState } from "react";
import ExpandIcon from "~/components/icons/expandIcon";
import CollapseIcon from "~/components/icons/collapseIcon";
import Expand from "~/components/reusables/expand";

export default function ConstraintSection(props: {
  linkableConstraints: Constraint[];
  linkedConstraints: Constraint[];
  flagId: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex gap-1 m-2 border-b-4 pb-2">
      <div className="flex flex-col items-center w-1/2 text-center border-r-2 pr-1">
        <h1>Available constraints</h1>

        <Expand>
          <ul className="space-y-2 py-2">
            {props.linkableConstraints.map((c: Constraint) => (
              <li key={`available_${c.id}`}>
                <LinkableConstraint c={c} flagId={props.flagId} />
              </li>
            ))}
          </ul>
        </Expand>
      </div>

      <div className="w-1/2 text-center">
        Applied constraints
        <ul className="space-y-2 p-2">
          {props.linkedConstraints.map((c: Constraint) => (
            <li key={`applied_${c.id}`}>
              <AppliedConstraint c={c} flagId={props.flagId} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
