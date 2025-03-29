import { Outlet } from "react-router";
import MenuItem from "~/ui/components/reusables/menuitem";
import FlagIcon from "~/ui/components/icons/flagIcon";
import HandIcon from "~/ui/components/icons/handIcon";
import UserSection from "../components/reusables/userSection";
import { Role } from "~/domain/user";
import UsersIcon from "../components/icons/usersIcon";
import UserIcon from "../components/icons/userIcon";
import { useState } from "react";
import UserPanel from "../components/reusables/userPanel";

export default function Dashboard() {
  const myRole = localStorage.getItem("role");
  const isAdmin = myRole === Role.ADMIN || myRole === Role.SUPERADMIN;
  const [userShown, setUserShown] = useState(false);
  return (
    <div className="flex md:flex-row flex-col items-stretch w-full min-h-screen">
      <div id="sidebar" className="flex-none md:w-52 md:h-screen h-12 m-0 z-20">
        <div className="fixed md:w-52 md:h-full h-12 left-0 right-0 top-0 md:flex md:flex-col justify-between md:border-r-4 bg-white">
          <div
            id="titleLogo"
            className="md:flex hidden items-center justify-center gap-2"
          >
            <img src="/images/logo.svg" alt="logo" className="p-8" />
          </div>

          <div
            id="sidebarTopSeparator"
            className="md:block hidden w-48 ml-2 h-1 bg-slate-500/25 rounded"
          ></div>

          <div
            id="navArea"
            className="h-full flex md:flex-col md:justify-between justify-between"
          >
            <div
              id="navLinks"
              className="pt-2 flex justify-around md:flex-col md:justify-start gap-2 items-stretch"
            >
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
                  tooltip="See what feature flags were removed (admin only)"
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
                  tooltip="Create and delete users (admin only)"
                >
                  <div className="text-gray-500">
                    <UsersIcon />
                  </div>
                </MenuItem>
              )}
            </div>

            <div
              id="userSmall"
              className="md:hidden m-3 bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center active:border-gray-400 active:bg-white active:border cursor-pointer"
              onClick={() => {
                setUserShown(!userShown);
              }}
            >
              <UserIcon />
            </div>

            <div id="UserSection" className="md:block hidden my-2">
              <UserSection />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 bg-opacity-25 flex-auto">
        <Outlet></Outlet>
        <div
          id="userPanel"
          className="md:hidden absolute top-16 left-4 right-4 bottom-16 z-50"
        >
          <UserPanel
            expanded={userShown}
            setExpanded={setUserShown}
            originY={0}
          />
        </div>
      </div>
    </div>
  );
}
