import PlusIcon from "../icons/plusIcon";

export default function PurplePlusButton(props: {
  onClick: Function;
  text: string;
  id: string;
}) {
  return (
    <button
      id={props.id}
      className="bg-purple-900 text-white font-bold uppercase text-sm h-12 m-3 p-3 px-5 cursor-pointer hover:bg-purple-700 active:bg-purple-800 rounded flex-none flex items-center"
      onClick={() => props.onClick()}
    >
      <PlusIcon></PlusIcon>
      <div className="md:block hidden">{props.text}</div>
    </button>
  );
}
