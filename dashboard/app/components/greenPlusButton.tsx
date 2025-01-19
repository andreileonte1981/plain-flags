import PlusIcon from "./icons/plusIcon";

export default function GreenPlusButton(props: {
  onClick: Function;
  text: string;
}) {
  return (
    <button
      className="bg-green-900 text-white font-bold uppercase text-sm m-3 p-3 px-5 cursor-pointer hover:bg-green-600 active:bg-green-700 rounded flex-none flex items-center"
      onClick={() => props.onClick()}
    >
      <PlusIcon></PlusIcon>
      {props.text}
    </button>
  );
}
