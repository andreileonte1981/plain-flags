import SearchIcon from "../icons/searchIcon";

export default function FilterEdit(props: {
  onChange: (e: any) => void;
  placeholder: string;
  tooltip?: string;
}) {
  return (
    <div className="group relative mx-auto">
      <input
        placeholder={props.placeholder}
        type="search"
        className="md:w-64 w-48 m-1 border-2 rounded p-1 focus:ring-0 focus:border-current placeholder-gray-300"
        onChange={props.onChange}
      />
      <button
        type="submit"
        className="absolute right-3 -top-1.5 mt-5 mr-0 bg-white pl-2 cursor-text"
      >
        <SearchIcon />
      </button>
      {props.tooltip && (
        <div className="absolute invisible group-hover:visible transition-opacity duration-300 opacity-0 group-hover:opacity-100 p-2 bg-black/90 rounded md:top-1 md:left-full md:w-full w-2/3 text-white text-sm font-bold z-5">
          {props.tooltip}
        </div>
      )}
    </div>
  );
}
