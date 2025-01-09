export default function Modal(props: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  message: string;
  setMessage: (val: string) => void;
}) {
  return (
    props.isOpen && (
      <div
        className="absolute flex items-center justify-center top-0 h-screen w-screen bg-black/80"
        onClick={(e) => {
          props.setIsOpen(false);
        }}
      >
        <div
          className="flex-0 flex flex-col items-center justify-around rounded bg-slate-100 w-1/2 h-1/3"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <h1 className="text-center text-lg p-5 text-gray-600">
            {props.message}
          </h1>
          <button
            className="bg-gray-500 rounded px-4 hover:px-3 py-2 text-white font-semibold text-lg hover:text-xl"
            onClick={() => {
              props.setIsOpen(false);
            }}
          >
            Close
          </button>
        </div>
      </div>
    )
  );
}
