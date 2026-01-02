import { redirect } from "react-router";
import Client from "~/client/client";
import type { Route } from "../../../+types/root";
import type Constraint from "~/domain/constraint";
import ConstraintCard from "./components/constraintCard";
import ConstraintFilters from "./components/constraintFilters";
import { useContext, useEffect, useState } from "react";
import CreateConstraintPanel from "./components/createConstraintPanel";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { AnimatePresence, motion } from "motion/react";
import { scrollToElement } from "~/utils/scrollTo";
import PurplePlusButton from "~/ui/components/reusables/purplePlusButton";
import CancelButton from "~/ui/components/reusables/cancelButton";
import SearchIcon from "~/ui/components/icons/searchIcon";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Constraints" },
    { name: "description", content: "Control access to your features" },
  ];
}

export async function clientLoader({}) {
  if (!Client.checkApiUrl()) {
    // debugger;
    return redirect("/");
  }
  if (!localStorage.getItem("jwt")) {
    return redirect("/login");
  }
  const response = await Client.get("constraints");

  return response.data;
}

export default function Constraints({ loaderData }: Route.ComponentProps) {
  const constraints = loaderData as Constraint[] | undefined;

  if (!constraints) {
    return <div>Loading...</div>;
  }

  const [filtersShown, setFiltersShown] = useState(false);

  const [filters, setFilters] = useState({
    description: "",
    key: "",
    value: "",
  });

  const filteredConstraints = constraints
    .filter(
      (c) =>
        c.description
          .toLowerCase()
          .indexOf(filters.description.toLowerCase()) >= 0
    )
    .filter((c) => c.key.toLowerCase().indexOf(filters.key.toLowerCase()) >= 0)
    .filter((c) =>
      c.values.some(
        (v) => v.toLowerCase().indexOf(filters.value.toLowerCase()) >= 0
      )
    );

  const [isCreateOpen, setCreateOpen] = useState(false);

  const { currentConstraint, setCurrentConstraint } = useContext(
    CurrentConstraintContext
  );

  useEffect(() => {
    scrollToElement(`constraintcard_${currentConstraint}`, "instant");
  }, []);

  return (
    <div>
      <div className="sticky md:top-0 top-12 z-10 bg-white md:mx-2">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center border-b-4 border-magenta/20 pb-2 md:pb-0">
          {filtersShown ? (
            <div className="flex md:flex-row flex-row-reverse md:gap-2 items-center">
              <CancelButton
                onClick={() => setFiltersShown(false)}
                text={"Close"}
              ></CancelButton>
              <ConstraintFilters filters={filters} setFilters={setFilters} />
            </div>
          ) : (
            <button
              id="showFiltersButton"
              className="bg-purple-900 text-white font-bold uppercase text-sm h-12 md:m-3 p-3 px-5 cursor-pointer hover:bg-purple-700 active:bg-purple-800 rounded flex-none"
              onClick={() => setFiltersShown(true)}
            >
              <SearchIcon />
            </button>
          )}
          <AnimatePresence initial={false}>
            {!isCreateOpen && (
              <motion.div
                initial={{ scale: 0, opacity: 0, height: 0 }}
                animate={{ scale: 1, opacity: 1, height: "auto" }}
                exit={{ scale: 0, opacity: 0, height: 0 }}
                transition={{ ease: "easeInOut", duration: 0.2 }}
              >
                <PurplePlusButton
                  id="createConstraintPanelToggle"
                  onClick={() => {
                    setCreateOpen(!isCreateOpen);
                  }}
                  text="Create new constraint"
                ></PurplePlusButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <CreateConstraintPanel
          isCreateOpen={isCreateOpen}
          setCreateOpen={setCreateOpen}
        />
      </div>

      <div>
        {!filteredConstraints.length && (
          <div className="text-center my-5 text-gray-400">
            No constraints found
          </div>
        )}

        <ul className="pt-4">
          <AnimatePresence initial={false} presenceAffectsLayout={true}>
            {filteredConstraints.map((c) => (
              <motion.li
                key={c.id}
                initial={{ scaleY: 0, height: 0 }}
                animate={{ scaleY: 1, height: "auto" }}
                exit={{ scaleY: 0, height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <ConstraintCard
                  id={c.id}
                  description={c.description}
                  constraintkey={c.key}
                  values={c.values}
                  flags={c.flags}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
