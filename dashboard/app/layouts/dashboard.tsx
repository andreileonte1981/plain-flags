import { Outlet, useNavigate } from "react-router";
import MenuItem from "~/components/menuitem";

import FlagIcon from "~/components/flagIcon";
import HandIcon from "~/components/handIcon";
import LogoutButton from "~/components/logoutButton";
import { useContext, useState } from "react";
import { ModalContext } from "~/context/modalContext";
import YesNo from "~/components/yesno";

export default function Dashboard() {
  const navigate = useNavigate();
  const { showMessage } = useContext(ModalContext);

  function logout() {
    localStorage.setItem("jwt", "");
    showMessage("You were logged out");
    return navigate("/");
  }

  const [logoutYNOpen, setLogoutYNOpen] = useState(false);

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
          <div className="w-48 ml-2 h-1 bg-slate-500/25 rounded"></div>

          {/* nav area */}
          <div className="h-full flex flex-col justify-between">
            {/* nav links */}
            <div className="pt-2 flex flex-col items-stretch">
              <MenuItem
                text="Flags"
                linkto="/"
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
                <div className="text-red-900">
                  <HandIcon />
                </div>
              </MenuItem>
            </div>

            <div className="mb-20">
              <YesNo
                question="Logout: are you sure?"
                onYes={logout}
                isOpen={logoutYNOpen}
                hide={() => {
                  setLogoutYNOpen(false);
                }}
              >
                <LogoutButton
                  handleLogout={() => setLogoutYNOpen(!logoutYNOpen)}
                />
              </YesNo>
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
