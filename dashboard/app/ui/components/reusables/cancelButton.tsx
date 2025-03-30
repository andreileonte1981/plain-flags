import CancelIcon from "../icons/cancelIcon";

export default function CancelButton(props: {
  onClick: Function;
  text: string;
}) {
  return (
    <button
      className="bg-red-950 text-white font-bold uppercase text-sm h-12 m-3 p-3 px-5 cursor-pointer hover:bg-red-600 active:bg-red-700 rounded flex-none flex gap-2 items-center"
      onClick={() => props.onClick()}
    >
      <CancelIcon />
      <div className="md:block hidden">{props.text}</div>
    </button>
  );
}
