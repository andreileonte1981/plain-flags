import { redirect } from "react-router";
import type { Flag } from "~/domain/flag";
import Client from "~/client/client";
import type { Route } from "../../../+types/root";
import { useContext, useEffect, useState } from "react";
import FlagFilters from "./components/flagFilters";
import GreenPlusButton from "~/ui/components/reusables/greenPlusButton";
import CreateFlagPanel from "./components/createFlagPanel";
import FlagListItems from "./components/flagListItems";
import scrollToElement from "../../../utils/scrollToElement";
import { CurrentFlagContext } from "~/context/currentFlagContext";

export async function clientLoader({}) {
  if (!localStorage.getItem("jwt")) {
    return redirect("/login");
  }

  const response = await Client.get("flags");

  return response.data;
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
    .filter((f) => (filters.stale ? f.stale : true))
    .filter((f) => (filters.active ? f.isOn : true));

  const [isCreateOpen, setCreateOpen] = useState(false);

  const { currentFlag, setCurrentFlag } = useContext(CurrentFlagContext);
  useEffect(() => {
    scrollToElement(currentFlag, "instant");
  }, []);

  return (
    <div className="mx-2 flex flex-col">
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex justify-between items-center border-b-4 py-2 ">
          <FlagFilters setFilters={setFilters} filters={filters} />
          <GreenPlusButton
            onClick={() => {
              setCreateOpen(!isCreateOpen);
            }}
            text="Create new flag"
          ></GreenPlusButton>
        </div>

        {isCreateOpen && <CreateFlagPanel setCreateOpen={setCreateOpen} />}
      </div>
      <ul className="flex flex-col w-full h-full">{FlagListItems(flags)}</ul>
    </div>
  );
}
