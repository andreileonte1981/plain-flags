import { redirect } from "react-router";
import Client from "~/client/client";
import type { Route } from "../../../+types/root";
import type Constraint from "~/domain/constraint";
import ConstraintCard from "./components/constraintCard";
import ConstraintFilters from "./components/constraintFilters";
import { useContext, useEffect, useState } from "react";
import GreenPlusButton from "~/ui/components/reusables/greenPlusButton";
import CreateConstraintPanel from "./components/createConstraintPanel";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { AnimatePresence, motion } from "motion/react";
import { scrollToElement } from "~/utils/scrollTo";

export async function clientLoader({}) {
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
      <div className="sticky top-0 z-10 bg-white mx-2">
        <div className="flex flex-wrap justify-between items-center border-b-4">
          <ConstraintFilters filters={filters} setFilters={setFilters} />
          <GreenPlusButton
            id="createConstraintPanelToggle"
            onClick={() => {
              setCreateOpen(!isCreateOpen);
            }}
            text="Create new constraint"
          ></GreenPlusButton>
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
