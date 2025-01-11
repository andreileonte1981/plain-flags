export default function FlagCard(props: {
  id: string;
  name: string;
  isOn: boolean;
  stale: boolean;
}) {
  return (
    <div className="border rounded bg-green-300 m-3">
      <h1>{props.id}</h1>
      <h1>{props.name}</h1>
      <h1>{props.isOn ? "on" : "off"}</h1>
      <h1>{props.stale === true && "stale!!!"}</h1>
    </div>
  );
}
