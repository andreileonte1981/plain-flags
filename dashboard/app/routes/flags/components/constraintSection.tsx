import type Constraint from "~/domain/constraint";
import LinkableConstraint from "./constraintCards/linkableConstraint";
import AppliedConstraint from "./constraintCards/appliedConstraint";

export default function ConstraintSection(props: {
  linkableConstraints: Constraint[];
  linkedConstraints: Constraint[];
  flagId: string;
}) {
  return (
    <div className="flex gap-1 m-2 border-b-4">
      <div className="w-1/2 text-center border-r-2">
        <h1>Available constraints</h1>
        <ul className="space-y-2 p-2">
          {props.linkableConstraints.map((c: Constraint) => (
            <li key={`available_${c.id}`}>
              <LinkableConstraint c={c} flagId={props.flagId} />
            </li>
          ))}
        </ul>
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
