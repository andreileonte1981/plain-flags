interface Filters {
  description: string;
  key: string;
  value: string;
}

export default function ConstraintFilters({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  return (
    <div className="flex flex-col items-end text-gray-600 font-semibold border-r-2 md:px-3 py-1">
      <input
        type="text"
        className="border rounded px-2 py-1 text-sm mb-1 focus:ring-0 focus:border-current placeholder-gray-400 w-40"
        placeholder="Description"
        value={filters.description}
        onChange={(e) =>
          setFilters({ ...filters, description: e.target.value })
        }
      />
      <input
        type="text"
        className="border rounded px-2 py-1 text-sm mb-1 focus:ring-0 focus:border-current placeholder-gray-400 w-40"
        placeholder="What for"
        value={filters.key}
        onChange={(e) => setFilters({ ...filters, key: e.target.value })}
      />
      <input
        type="text"
        className="border rounded px-2 py-1 text-sm focus:ring-0 focus:border-current placeholder-gray-400 w-40"
        placeholder="Who/which for"
        value={filters.value}
        onChange={(e) => setFilters({ ...filters, value: e.target.value })}
      />
    </div>
  );
}
