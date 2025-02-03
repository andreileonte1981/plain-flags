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
    <div className="flex flex-wrap items-center text-gray-600 font-semibold border-r-2 px-3">
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
        <label htmlFor="staleFilter" className="m-2">
          Stale
          <input
            id="staleFilter"
            name="staleFilter"
            type="checkbox"
            className="ml-2 border-2 rounded checked:bg-black focus:checked:bg-black hover:checked:bg-black focus:ring-0"
            onChange={(e) => {
              props.setFilters({ ...props.filters, stale: e.target.checked });
            }}
          />
        </label>

        <label htmlFor="activeFilter" className="m-2">
          Active
          <input
            id="activeFilter"
            name="activeFilter"
            type="checkbox"
            className="ml-2 border-2 rounded checked:bg-black focus:checked:bg-black hover:checked:bg-black focus:ring-0"
            onChange={(e) => {
              props.setFilters({ ...props.filters, active: e.target.checked });
            }}
          />
        </label>
      </div>
    </div>
  );
}
