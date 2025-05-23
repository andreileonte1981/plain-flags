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
        <svg
          className="text-gray-400 h-4 w-4 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          version="1.1"
          id="Capa_1"
          x="0px"
          y="0px"
          viewBox="0 0 56.966 56.966"
          xmlSpace="preserve"
          width="512px"
          height="512px"
        >
          <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
        </svg>
      </button>
      {props.tooltip && (
        <div className="absolute invisible group-hover:visible transition-opacity duration-300 opacity-0 group-hover:opacity-100 p-2 bg-black/90 rounded md:top-1 md:left-full md:w-full w-2/3 text-white text-sm font-bold z-5">
          {props.tooltip}
        </div>
      )}
    </div>
  );
}
