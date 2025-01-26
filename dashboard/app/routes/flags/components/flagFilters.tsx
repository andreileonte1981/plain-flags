import FilterEdit from "~/components/reusables/filterEdit";

export default function FlagFilters(props: {
  setFilters: Function;
  filters: any;
}) {
  return (
    <div className="flex flex-wrap items-center text-gray-600 font-semibold border-r-2 px-3">
      <FilterEdit
        onChange={(e) => {
          props.setFilters({ ...props.filters, name: e.target.value });
        }}
        placeholder="Name"
      />

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
