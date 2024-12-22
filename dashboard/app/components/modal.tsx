export default function Modal(props: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  message: string;
  setMessage: (val: string) => void;
}) {
  return (
    props.isOpen && (
      <>
        <h1>{props.message}</h1>
        <button
          onClick={() => {
            props.setIsOpen(false);
          }}
        >
          Close
        </button>
      </>
    )
  );
}
