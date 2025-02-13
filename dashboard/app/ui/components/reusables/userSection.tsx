import SubtleButton from "./subtleButton";
import { useNavigate } from "react-router";
import { useContext, useState } from "react";
import { ToastContext } from "~/context/toastContext";
import UserIcon from "../icons/userIcon";
import LogoutIcon from "../icons/logoutIcon";
import YesNoWrap from "./yesnoWrap";
import { AnimatePresence, motion } from "motion/react";
import Client from "~/client/client";
import { ModalContext } from "~/context/modalContext";
import PasswordEdit from "./passwordEdit";

export default function UserSection() {
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

  const [expanded, setExpanded] = useState(false);
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

  return (
    <div className="m-2 mb-0">
      <div className="-mb-4">
        <AnimatePresence initial={false} mode="wait">
          {expanded && (
            <motion.div
              initial={{ originX: 0.5, originY: 1, scale: 0, height: 0 }}
              animate={{ scale: 1, height: "auto" }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div
                onMouseLeave={() => setExpanded(false)}
                className="flex flex-col gap-4 border-2 rounded border-gray-300 py-4"
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
                  <SubtleButton onClick={() => {}} text="Logout" id="btnlogout">
                    <LogoutIcon />
                  </SubtleButton>
                </YesNoWrap>
                <div className="text-center text-gray-500 text-sm break-all">
                  {userEmail}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mb-4">
        <AnimatePresence initial={false} mode="wait">
          {!expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0 }}
              transition={{ duration: 0.2, ease: "easeIn" }}
            >
              <div
                onMouseEnter={() => {
                  setExpanded(true);
                }}
                className="flex gap-1 items-center justify-center text-gray-500 hover:text-red-500 active:text-red-800 cursor-pointer"
              >
                <div id="Me" className="font-semibold text-center">
                  Me
                </div>
                <div className="flex-none">
                  <UserIcon />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
