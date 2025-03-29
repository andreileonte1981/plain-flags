import ClockIcon from "~/ui/components/icons/clockIcon";
import FlagIcon from "~/ui/components/icons/flagIcon";
import FilterEdit from "~/ui/components/reusables/filterEdit";

export default function FlagFilters(props: {
  setFilters: Function;
  filters: {
    name: string;
    constraint: string;
    stale: boolean;
    active: boolean;
  };
}) {
  return (
    <div className="flex flex-wrap items-center text-gray-600 font-semibold md:border-r-2 md:px-3">
      <div>
        <FilterEdit
          onChange={(e) => {
            props.setFilters({ ...props.filters, name: e.target.value });
          }}
          placeholder="Name"
          tooltip="Search for features by name"
        />

        <FilterEdit
          onChange={(e) => {
            props.setFilters({ ...props.filters, constraint: e.target.value });
          }}
          placeholder="Constraint"
          tooltip="Search for features by constraint description or other constraint details, like users, brand, key names"
        />
      </div>

      <div>
        <label htmlFor="staleFilter" className="m-2 flex items-center">
          <span className="md:block hidden">Stale</span>
          <div className="md:hidden" style={{ color: "#aaaa00" }}>
            <ClockIcon />
          </div>
          <input
            id="staleFilter"
            name="staleFilter"
            type="checkbox"
            className="md:w-4 md:h-4 w-8 h-8 ml-2 border-2 rounded checked:bg-black focus:checked:bg-black hover:checked:bg-black focus:ring-0"
            onChange={(e) => {
              props.setFilters({ ...props.filters, stale: e.target.checked });
            }}
          />
        </label>

        <label htmlFor="activeFilter" className="m-2 flex items-center">
          <span className="md:block hidden">Active</span>
          <div className="md:hidden text-green-800">
            <FlagIcon />
          </div>
          <input
            id="activeFilter"
            name="activeFilter"
            type="checkbox"
            className="md:w-4 md:h-4 w-8 h-8 ml-2 border-2 rounded checked:bg-black focus:checked:bg-black hover:checked:bg-black focus:ring-0"
            onChange={(e) => {
              props.setFilters({ ...props.filters, active: e.target.checked });
            }}
          />
        </label>
      </div>
    </div>
  );
}
