import { createContext } from "react";

export class ToastMessage {
  static readonly delay = 4000;

  constructor(public text: string, public id: string) {}
}

export const ToastContext = createContext({
  queueToast: (message: string) => {},
  removeToast: (id: string) => {},
});
