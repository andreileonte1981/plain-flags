import { createContext } from "react";

export const CurrentConstraintContext = createContext({
  currentConstraint: "",
  setCurrentConstraint: (_s: string) => {},
});
