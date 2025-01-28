import type Constraint from "~/domain/constraint";
import LinkableConstraint from "./constraintCards/linkableConstraint";
import AppliedConstraint from "./constraintCards/appliedConstraint";
import { useState } from "react";
import ExpandIcon from "~/components/icons/expandIcon";
import CollapseIcon from "~/components/icons/collapseIcon";

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

        {!expanded ? (
          <div className="flex flex-col items-stretch w-full mt-2 px-2">
            <button
              className="flex items-center justify-center gap-1 p-1 w-full border-2 border-gray-500 rounded uppercase text-xs font-extrabold hover:text-black hover:shadow active:scale-y-95"
              onClick={() => setExpanded(true)}
            >
              Show
              <ExpandIcon />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-stretch w-full mt-2 px-2">
            <button
              className="flex items-center justify-center gap-1 p-1 w-full border-2 border-gray-500 rounded uppercase text-xs font-extrabold hover:text-black hover:shadow active:scale-y-95"
              onClick={() => setExpanded(false)}
            >
              Hide
              <CollapseIcon />
            </button>
            <ul className="space-y-2 py-2">
              {props.linkableConstraints.map((c: Constraint) => (
                <li key={`available_${c.id}`}>
                  <LinkableConstraint c={c} flagId={props.flagId} />
                </li>
              ))}
            </ul>
          </div>
        )}
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
