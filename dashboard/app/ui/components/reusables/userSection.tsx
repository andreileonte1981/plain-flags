import YesNoWrap from "./yesnoWrap";
import LogoutButton from "./logoutButton";
import { useNavigate } from "react-router";
import { useContext, useState } from "react";
import { ToastContext } from "~/context/toastContext";
import UserIcon from "../icons/userIcon";
import CloseIcon from "../icons/closeIcon";

export default function UserSection() {
  const navigate = useNavigate();
  const { queueToast } = useContext(ToastContext);

  function logout() {
    localStorage.setItem("jwt", "");
    queueToast("You have been logged out.");
    return navigate("/login");
  }

  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {expanded ? (
        <div>
          <div className="border-2 rounded border-gray-300 m-2 p-2">
            <YesNoWrap
              clickId="openLogoutYesNo"
              question="Logout: are you sure?"
              onYes={logout}
            >
              <LogoutButton clickId="openLogoutYesNo" />
            </YesNoWrap>
          </div>
          <div
            onClick={() => {
              setExpanded(false);
            }}
            className="flex items-center justify-center text-gray-500 mx-2 hover:text-red-500 active:text-red-800 cursor-pointer"
          >
            <div id="Me" className="font-semibold text-center ">
              Close
            </div>
            <div className="mx-1 flex-none">
              <CloseIcon />
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            setExpanded(true);
          }}
          className="flex items-center justify-center text-gray-500 mx-2 hover:text-red-500 active:text-red-800 cursor-pointer"
        >
          <div id="Me" className="font-semibold text-center ">
            Me
          </div>
          <div className="mx-1 flex-none">
            <UserIcon />
          </div>
        </div>
      )}
    </div>
  );
}
