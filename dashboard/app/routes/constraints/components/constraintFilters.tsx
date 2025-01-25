export default function ConstraintFilters(props: {
  setFilters: Function;
  filters: any;
}) {
  return (
    <div className="flex flex-wrap items-center text-gray-600 font-semibold border-r-2 px-3">
      <label htmlFor="descriptionFilter" className="m-2">
        Description
        <input
          id="descriptionFilter"
          name="descriptionFilter"
          type="text"
          className="ml-2 border-2 rounded p-2 focus:ring-0 focus:border-current"
          onChange={(e) => {
            props.setFilters({ ...props.filters, description: e.target.value });
          }}
        />
      </label>
    </div>
  );
}
