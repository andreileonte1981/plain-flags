import { useContext, useState } from "react";
import { Link, useRevalidator } from "react-router";
import type { Constraint } from "~/client/api-client";
import { getApiClient } from "~/client/api-client";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { extractErrorMessage } from "~/utils/errorMessage";
import LinkIcon from "~/ui/icons/linkIcon";

export default function AppliedConstraint({
  constraint,
  flagId,
}: {
  constraint: Constraint;
  flagId: string;
}) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const revalidator = useRevalidator();
  const { setCurrentConstraint } = useContext(CurrentConstraintContext);

  async function unlink() {
    setLoading(true);
    setError("");
    try {
      await getApiClient().unlinkConstraint(flagId, constraint.id);
      setConfirm(false);
      revalidator.revalidate();
    } catch (err) {
      setError(extractErrorMessage(err, "Error removing constraint"));
      setLoading(false);
      setConfirm(false);
    }
  }

  return (
    <div className="flex flex-wrap justify-between items-center border-2 rounded p-2 mb-2">
      <div className="flex flex-col items-start gap-1 mt-1">
        {confirm ? (
          <>
            <div className="flex gap-1.5 items-center">
              <span className="text-xs text-gray-600 font-semibold">
                Remove?
              </span>
              <button
                className="text-xs px-2 py-1 rounded text-white bg-red-600 hover:bg-red-500 font-medium disabled:opacity-50"
                disabled={loading}
                onClick={unlink}
              >
                {loading ? "…" : "Yes"}
              </button>
              <button
                className="text-xs text-gray-500 hover:underline"
                onClick={() => setConfirm(false)}
              >
                No
              </button>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </>
        ) : (
          <button
            className="flex items-center gap-1 border-2 border-green-700 rounded bg-green-50 px-2 py-1 text-green-700 text-xs uppercase font-bold hover:bg-green-100 active:scale-95"
            onClick={() => setConfirm(true)}
          >
            Remove
          </button>
        )}
      </div>

      <div className="text-right break-all">
        <Link
          to="/constraints"
          onClick={() => setCurrentConstraint(constraint.id)}
          className="inline-flex gap-1 items-center text-purple-700 hover:underline font-semibold"
        >
          <LinkIcon />
          {constraint.description}
        </Link>
        <p className="text-sm text-gray-600">
          For: <span className="font-bold text-gray-700">{constraint.key}</span>
        </p>
        <div className="text-sm text-gray-600">
          Named:
          <div className="flex flex-col font-bold text-gray-700">
            {constraint.values.map((v, i) => (
              <span key={i}>{v}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
