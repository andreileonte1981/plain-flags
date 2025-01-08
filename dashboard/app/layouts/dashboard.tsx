import { Outlet } from "react-router";
import MenuItem from "~/components/menuitem";

import FlagIcon from "~/components/flagIcon";
import HandIcon from "~/components/handIcon";

export default function Dashboard() {
  return (
    <div className="flex items-stretch w-screen">
      <div className="flex-none w-64 m-0 bg-gray-100 bg-opacity-25 border border-gray-900">
        <div className="fixed w-64 left-0 right-0">
          <div>
            <h1 className="text-center p-3 font-bold text-gray-500">
              Plain Flags
            </h1>
          </div>
          <div className="w-60 h-1 ml-2 bg-gray-700"></div>
          <div className="pt-2 flex flex-col items-stretch">
            <MenuItem text="Flags" linkto="/">
              <div className="text-green-600">
                <FlagIcon />
              </div>
            </MenuItem>
            <MenuItem text="Constraints" linkto="/constraints">
              <div className="text-red-900">
                <HandIcon />
              </div>
            </MenuItem>
          </div>
        </div>
      </div>

      <div className="bg-red-300 flex-auto">
        <Outlet></Outlet>
      </div>
    </div>
  );
}
