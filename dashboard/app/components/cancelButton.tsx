export default function CancelButton(props: {
  onClick: Function;
  text: string;
}) {
  return (
    <button
      className="bg-red-950 text-white font-bold uppercase text-sm h-12 m-3 p-3 px-5 cursor-pointer hover:bg-red-600 active:bg-red-700 rounded flex-none flex items-center"
      onClick={() => props.onClick()}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6 mr-2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>

      {props.text}
    </button>
  );
}
