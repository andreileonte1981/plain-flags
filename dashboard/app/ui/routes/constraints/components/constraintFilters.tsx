import FilterEdit from "~/ui/components/reusables/filterEdit";

export default function ConstraintFilters(props: {
  setFilters: Function;
  filters: any;
}) {
  return (
    <div className="flex flex-col items-end text-gray-600 font-semibold border-r-2 px-3 py-1">
      <FilterEdit
        onChange={(e) => {
          props.setFilters({ ...props.filters, description: e.target.value });
        }}
        placeholder="Description"
      />

      <FilterEdit
        onChange={(e) => {
          props.setFilters({ ...props.filters, key: e.target.value });
        }}
        placeholder="What for"
      />

      <FilterEdit
        onChange={(e) => {
          props.setFilters({ ...props.filters, value: e.target.value });
        }}
        placeholder="Who/which for"
      />
    </div>
  );
}
