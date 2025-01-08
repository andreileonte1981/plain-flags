import type { Flag } from "~/flags/flag";

function flagListItems(flagData?: Flag[]) {
  if (!flagData) {
    return <h1>loading...</h1>;
  }
  return flagData.map((f) => (
    <li key={f.id}>
      <h1>{f.id}</h1>
      <h1>{f.name}</h1>
      <h1>{f.isOn ? "on" : "off"}</h1>
      <h1>{f.stale === true && "stale!!!"}</h1>
    </li>
  ));
}

export default function FlagList(props: { flags: Flag[] | undefined }) {
  return (
    <>
      <div>
        <h1>Flags</h1>
        <ul>{flagListItems(props.flags)}</ul>
      </div>
    </>
  );
}
