import type { HistoryEntry } from "~/client/api-client";

function WhatLabel({ what }: { what: string }) {
  switch (what) {
    case "create":
      return <span className="text-blue-800">created the feature </span>;
    case "archive":
      return <span className="text-red-950">archived the feature </span>;
    case "turnon":
      return <span className="text-green-700">turned the feature on </span>;
    case "turnoff":
      return <span className="text-red-800">turned the feature off </span>;
    case "link":
      return <span className="text-magenta">constrained the feature to </span>;
    case "unlink":
      return (
        <span className="text-green-900">unconstrained the feature from </span>
      );
    case "cvedit":
      return (
        <span className="text-magenta-500">changed constraint values </span>
      );
    default:
      return <span>{what} </span>;
  }
}

export default function HistoryItem({
  userEmail,
  what,
  when,
  constraintInfo,
}: HistoryEntry) {
  return (
    <p className="break-all">
      <span>{userEmail} </span>
      <WhatLabel what={what} />
      {constraintInfo && <span>{constraintInfo} </span>}
      at{" "}
      <span className="font-extrabold">{new Date(when).toLocaleString()}</span>
    </p>
  );
}
