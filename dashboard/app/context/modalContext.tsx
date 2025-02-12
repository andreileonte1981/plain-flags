import { createContext } from "react";

export type ModalIconType = "error" | "info";

export const ModalContext = createContext({
  showMessage: (text: string, iconType: ModalIconType = "error") => {},
});
