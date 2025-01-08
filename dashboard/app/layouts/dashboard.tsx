import { Outlet, useNavigate } from "react-router";
import MenuItem from "~/components/menuitem";

import FlagIcon from "~/components/flagIcon";
import HandIcon from "~/components/handIcon";
import LogoutButton from "~/components/logoutButton";

export default function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.setItem("jwt", "");
    return navigate("/");
  }

  return (
    <div className="flex items-stretch w-full min-h-screen">
      <div className="flex-none w-52 m-0 bg-gray-50 shadow">
        <div className="fixed w-52 h-full left-0 right-0">
          {/* title/logo */}
          <div>
            <h1 className="text-center p-3 font-bold text-gray-500">
              Plain Flags
            </h1>
          </div>

          {/* separator */}
          <div className="w-48 ml-2 h-1 bg-gray-400 rounded"></div>

          {/* nav area */}
          <div className="h-full flex flex-col justify-between">
            {/* nav links */}
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

            <LogoutButton handleLogout={handleLogout} />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 bg-opacity-25 flex-auto">
        <Outlet></Outlet>
      </div>
    </div>
  );
}
