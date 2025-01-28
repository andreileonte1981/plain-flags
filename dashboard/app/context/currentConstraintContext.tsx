import { createContext } from "react";

export const CurrentConstraintContext = createContext({
  currentConstraint: "",
  setCurrentConstraint: (s: string) => {},
});
