import type { Flag } from "~/domain/flag";
import FlagCard from "./flagCard";

export default function FlagListItems(flagData?: Flag[]) {
  if (!flagData?.length) {
    return <h1>loading...</h1>;
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
