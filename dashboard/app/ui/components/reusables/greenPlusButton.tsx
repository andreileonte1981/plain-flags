import PlusIcon from "../icons/plusIcon";

export default function GreenPlusButton(props: {
  onClick: Function;
  text: string;
  id: string;
}) {
  return (
    <button
      id={props.id}
      className="bg-green-900 text-white font-bold uppercase text-sm h-12 md:m-3 p-3 px-5 cursor-pointer hover:bg-green-600 active:bg-green-700 rounded flex-none flex gap-2 items-center"
      onClick={() => props.onClick()}
    >
      <PlusIcon></PlusIcon>
      <div className="md:block hidden">{props.text}</div>
    </button>
  );
}
