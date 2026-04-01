import { Link } from "react-router";
import type { Constraint } from "~/client/api-client";
import LinkableConstraint from "./linkableConstraint";
import AppliedConstraint from "./appliedConstraint";
import Expand from "~/ui/components/expand";
import LinkIcon from "~/ui/icons/linkIcon";

export default function ConstraintSection({
  availableConstraints,
  appliedConstraints,
  flagId,
}: {
  availableConstraints: Constraint[];
  appliedConstraints: Constraint[];
  flagId: string;
}) {
  return (
    <div className="flex md:flex-row flex-col md:gap-1 gap-4 m-2 border-b-4 border-gray-200 pb-4">
      {/* Available */}
      <div className="flex flex-col items-center md:w-1/2 text-center md:border-r-2 pr-1">
        {availableConstraints.length ? (
          <>
            <h2 className="font-bold text-gray-600 mb-1">
              Available constraints
            </h2>
            <Expand>
              <ul className="py-2 w-full">
                {availableConstraints.map((c) => (
                  <li key={`available_${c.id}`}>
                    <LinkableConstraint constraint={c} flagId={flagId} />
                  </li>
                ))}
              </ul>
            </Expand>
          </>
        ) : (
          <div className="flex flex-col gap-2 text-gray-500">
            <span>No available constraints</span>
            <Link
              to="/constraints"
              className="flex items-center justify-center text-sm text-red-600 hover:underline"
            >
              Create constraints here
              <LinkIcon />
            </Link>
          </div>
        )}
      </div>

      {/* Applied */}
      <div className="md:w-1/2 text-center">
        <h2 className="font-bold text-gray-600 mb-1">Applied constraints</h2>
        {appliedConstraints.length === 0 ? (
          <p className="text-gray-400 text-sm">None applied</p>
        ) : (
          <ul className="p-2">
            {appliedConstraints.map((c) => (
              <li key={`applied_${c.id}`}>
                <AppliedConstraint constraint={c} flagId={flagId} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
