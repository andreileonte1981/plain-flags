import type { ReactElement, ReactNode } from "react";

export default function YesNo(props: {
  children: ReactNode; // should take a button
  question: string;
  onYes: Function;
  isOpen: boolean;
  hide: Function;
}) {
  return (
    <div>
      {props.isOpen && (
        <div>
          {props.question}
          <div
            onClick={() => {
              props.onYes();
              props.hide();
            }}
          >
            Yes
          </div>
          <div onClick={() => props.hide()}>No</div>
        </div>
      )}
      {!props.isOpen && props.children}
    </div>
  );
}
