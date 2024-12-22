import { createContext } from "react";

export const ModalContext = createContext({
  isOpen: false,
  setIsOpen: (on: boolean) => {},
  message: "",
  setMessage: (s: string) => {},
});
