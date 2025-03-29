import { AnimatePresence, motion } from "motion/react";
import PasswordEdit from "./passwordEdit";
import YesNoWrap from "./yesnoWrap";
import SubtleButton from "./subtleButton";
import LogoutIcon from "../icons/logoutIcon";
import { useNavigate } from "react-router";
import { useContext, useState } from "react";
import { ToastContext } from "~/context/toastContext";
import { ModalContext } from "~/context/modalContext";
import Client from "~/client/client";
import { Role } from "~/domain/user";
import UserIcon from "../icons/userIcon";
import AdminIcon from "../icons/adminIcon";
import { div } from "motion/react-client";

export default function UserPanel(props: {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  originY: number;
}) {
  const navigate = useNavigate();
  const { queueToast } = useContext(ToastContext);
  const { showMessage } = useContext(ModalContext);

  function logout() {
    localStorage.setItem("jwt", "");
    queueToast("You have been logged out.");
    return navigate("/login");
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setChangePasswordError("New password must match");
      return;
    }

    try {
      const response = await Client.post("users/changePassword", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.status === 200) {
        showMessage("Changed password successfully", "info");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "Registration error");
    }
  }

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (event: any) => {
    setChangePasswordError("");
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };
  const [changePasswordError, setChangePasswordError] = useState("");

  const userEmail = localStorage.getItem("email");
  const userRole = localStorage.getItem("role");

  return (
    <AnimatePresence initial={false} mode="wait">
      {props.expanded && (
        <div>
          <div
            id="backdrop"
            className="fixed inset-0 bg-black/90 md:hidden -z-10"
            onClick={() => {
              props.setExpanded(false);
            }}
          />
          <motion.div
            initial={{
              originX: 0.5,
              originY: props.originY,
              scale: 0,
              height: 0,
            }}
            animate={{ scale: 1, height: "auto" }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div
              onMouseLeave={() => props.setExpanded(false)}
              className="flex flex-col gap-4 border-2 rounded bg-gray-100 border-gray-300 shadow-md py-4"
            >
              <form
                className="flex flex-col gap-2 p-2 border-b-2"
                onSubmit={changePassword}
              >
                <PasswordEdit
                  defaultValue={formData.currentPassword}
                  handleChange={handleChange}
                  id="currentPassword"
                  placeholder="Current password"
                  error=""
                  autofocus={true}
                />
                <PasswordEdit
                  defaultValue={formData.newPassword}
                  handleChange={handleChange}
                  id="newPassword"
                  placeholder="New password"
                  error=""
                />
                <PasswordEdit
                  defaultValue={formData.confirmPassword}
                  handleChange={handleChange}
                  id="confirmPassword"
                  placeholder="Confirm password"
                  error={changePasswordError}
                />
                <button
                  type="submit"
                  className="hover:bg-gray-300 active:bg-gray-200 border-gray-400 ml-5 mr-5 text-center rounded cursor-pointer text-gray-600 hover:text-red-800"
                >
                  <div className="flex gap-1 justify-center items-center">
                    <span className="font-semibold uppercase text-sm">
                      Change password
                    </span>
                  </div>
                </button>
              </form>
              <YesNoWrap
                clickId="btnlogout"
                question="Log out?"
                onYes={() => {
                  logout();
                }}
              >
                <SubtleButton onClick={() => {}} text="Log out" id="btnlogout">
                  <LogoutIcon />
                </SubtleButton>
              </YesNoWrap>
              <div className="flex flex-col gap-1 items-center text-center text-gray-500 text-sm break-all px-2">
                {userRole === Role.USER && <UserIcon />}
                {(userRole === Role.ADMIN || userRole === Role.SUPERADMIN) && (
                  <div className="flex">
                    <UserIcon />
                    <AdminIcon />
                  </div>
                )}
                {userEmail}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
