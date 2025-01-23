import type { Flag } from "~/domain/flag";
import FlagCard from "./flagCard";

export default function FlagListItems(flagData?: Flag[]) {
  if (!flagData?.length) {
    return (
      <div className="flex items-center justify-center">
        <h1 className="font-semibold text-lg my-10">No flags</h1>
      </div>
    );
  }
  return flagData.map((f) => (
    <li key={f.id}>
      <FlagCard
        id={f.id}
        name={f.name}
        isOn={f.isOn}
        stale={f.stale}
        constraints={f.constraints}
      />
    </li>
  ));
}
