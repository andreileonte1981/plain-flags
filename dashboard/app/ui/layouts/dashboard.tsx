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
          <div
            id="titleLogo"
            className="flex items-center justify-center py-4 gap-2"
          >
            <img src="app/graphics/logo.svg" alt="logo" className="w-12 h-12" />
            <h1 className="text-center font-bold text-gray-500 text-lg uppercase">
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
              {isAdmin && (
                <MenuItem
                  text="Archived Flags"
                  linkto="archived"
                  tooltip="Manage user accounts here"
                >
                  <div className="text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="size-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </MenuItem>
              )}
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
