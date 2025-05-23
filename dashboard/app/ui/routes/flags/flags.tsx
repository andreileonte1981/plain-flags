import { redirect } from "react-router";
import type { Flag } from "~/domain/flag";
import Client from "~/client/client";
import type { Route } from "../../../+types/root";
import { useContext, useEffect, useState } from "react";
import FlagFilters from "./components/flagFilters";
import GreenPlusButton from "~/ui/components/reusables/greenPlusButton";
import CreateFlagPanel from "./components/createFlagPanel";
import FlagListItems from "./components/flagListItems";
import { CurrentFlagContext } from "~/context/currentFlagContext";
import { scrollToElement } from "~/utils/scrollTo";
import { AnimatePresence, motion } from "motion/react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Feature Flags" },
    { name: "description", content: "Control your feature release" },
  ];
}

export async function clientLoader({}) {
  if (!localStorage.getItem("jwt")) {
    return redirect("/login");
  }

  const response = await Client.get("flags");

  return response?.data;
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const unfilteredFlags: Flag[] | undefined = loaderData as Flag[] | undefined;

  if (!unfilteredFlags) {
    return <div>Loading...</div>;
  }

  const [filters, setFilters] = useState({
    name: "",
    constraint: "",
    stale: false,
    active: false,
  });

  const flags = unfilteredFlags
    ?.filter(
      (f) => f.name.toLowerCase().indexOf(filters.name.toLowerCase()) >= 0
    )
    .filter((f) =>
      filters.constraint
        ? f.constraints.some((c) => {
            return (
              c.description
                .toLowerCase()
                .indexOf(filters.constraint.toLowerCase()) >= 0 ||
              c.key.toLowerCase().indexOf(filters.constraint.toLowerCase()) >=
                0 ||
              c.values
                .join()
                .toLowerCase()
                .indexOf(filters.constraint.toLowerCase()) >= 0
            );
          })
        : true
    )
    .filter((f) => (filters.stale ? f.stale : true))
    .filter((f) => (filters.active ? f.isOn : true));

  const [isCreateOpen, setCreateOpen] = useState(false);

  const { currentFlag, setCurrentFlag } = useContext(CurrentFlagContext);
  useEffect(() => {
    scrollToElement(currentFlag, "instant");
  }, []);

  return (
    <div className="md:mx-2 flex flex-col">
      <div className="sticky md:top-0 top-12 w-full z-10 bg-white">
        <div className="flex flex-wrap items-center border-b-4 border-green-600/30 md:py-2 md:px-2">
          <FlagFilters setFilters={setFilters} filters={filters} />
          <AnimatePresence initial={false}>
            {!isCreateOpen && (
              <motion.div
                initial={{ scale: 0, opacity: 0, height: 0 }}
                animate={{ scale: 1, opacity: 1, height: "auto" }}
                exit={{ scale: 0, opacity: 0, height: 0 }}
                transition={{ ease: "easeInOut", duration: 0.2 }}
              >
                <GreenPlusButton
                  id="createFlagPanelToggle"
                  onClick={() => {
                    setCreateOpen(!isCreateOpen);
                  }}
                  text="Create new flag"
                ></GreenPlusButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CreateFlagPanel
          isCreateOpen={isCreateOpen}
          setCreateOpen={setCreateOpen}
        />
      </div>
      <ul className="flex flex-col w-full h-full pt-4">
        {FlagListItems(flags)}
      </ul>
    </div>
  );
}
