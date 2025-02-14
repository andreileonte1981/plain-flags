import { Outlet } from "react-router";
import MenuItem from "~/ui/components/reusables/menuitem";

import FlagIcon from "~/ui/components/icons/flagIcon";
import HandIcon from "~/ui/components/icons/handIcon";
import UserSection from "../components/reusables/userSection";
import UserIcon from "../components/icons/userIcon";
import { Role } from "~/domain/user";

export default function Dashboard() {
  const myRole = localStorage.getItem("role");
  const isAdmin = myRole === Role.ADMIN || myRole === Role.SUPERADMIN;
  return (
    <div className="flex items-stretch w-full min-h-screen">
      <div id="sidebar" className="flex-none w-52 m-0 border-r-4 z-20">
        <div className="fixed w-52 h-full left-0 right-0 flex flex-col justify-between">
          <div id="titleLogo">
            <h1 className="text-center p-3 font-bold text-gray-500">
              Plain Flags
            </h1>
          </div>

          {/* separator */}
          <div className="w-48 ml-2 h-1 bg-slate-500/25 rounded"></div>

          {/* nav area */}
          <div className="h-full flex flex-col justify-between">
            {/* nav links */}
            <div className="pt-2 flex flex-col gap-2 items-stretch">
              <MenuItem
                text="Flags"
                linkto="/flags"
                tooltip="Control your features here"
              >
                <div className="text-green-600">
                  <FlagIcon />
                </div>
              </MenuItem>
              <MenuItem
                text="Constraints"
                linkto="/constraints"
                tooltip="Customise access to your features here"
              >
                <div className="text-magenta-500">
                  <HandIcon />
                </div>
              </MenuItem>
              {isAdmin && (
                <MenuItem
                  text="Users"
                  linkto="/users"
                  tooltip="Manage user accounts here"
                >
                  <div className="text-gray-500">
                    <UserIcon />
                  </div>
                </MenuItem>
              )}
            </div>

            <div id="UserSection" className="my-2">
              <UserSection />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 bg-opacity-25 flex-auto">
        <Outlet></Outlet>
      </div>
    </div>
  );
}
