export default function ConstraintFilters(props: {
  setFilters: Function;
  filters: any;
}) {
  return (
    <div className="flex flex-col items-end text-gray-600 font-semibold border-r-2 px-3 py-1">
      <label htmlFor="descriptionFilter" className="m-1">
        Description
        <input
          id="descriptionFilter"
          name="descriptionFilter"
          type="text"
          className="ml-2 border-2 rounded p-1 focus:ring-0 focus:border-current"
          onChange={(e) => {
            props.setFilters({ ...props.filters, description: e.target.value });
          }}
        />
      </label>
      <label htmlFor="keyFilter" className="m-1">
        What for
        <input
          id="keyFilter"
          name="keyFilter"
          type="text"
          className="ml-2 border-2 rounded p-1 focus:ring-0 focus:border-current"
          onChange={(e) => {
            props.setFilters({ ...props.filters, key: e.target.value });
          }}
        />
      </label>
      <label htmlFor="valueFilter" className="m-1">
        Who/which for
        <input
          id="valueFilter"
          name="valueFilter"
          type="text"
          className="ml-2 border-2 rounded p-1 focus:ring-0 focus:border-current"
          onChange={(e) => {
            props.setFilters({ ...props.filters, value: e.target.value });
          }}
        />
      </label>
    </div>
  );
}
