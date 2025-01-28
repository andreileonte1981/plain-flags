import { createContext } from "react";

export const CurrentFlagContext = createContext({
  currentFlag: "",
  setCurrentFlag: (s: string) => {},
});
