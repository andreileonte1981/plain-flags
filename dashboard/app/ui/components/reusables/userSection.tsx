import SubtleButton from "./subtleButton";
import { useNavigate } from "react-router";
import { useContext, useState } from "react";
import { ToastContext } from "~/context/toastContext";
import UserIcon from "../icons/userIcon";
import LogoutIcon from "../icons/logoutIcon";
import YesNoWrap from "./yesnoWrap";
import LocalError from "./localError";
import { AnimatePresence, motion } from "motion/react";

export default function UserSection() {
  const navigate = useNavigate();
  const { queueToast } = useContext(ToastContext);

  function logout() {
    localStorage.setItem("jwt", "");
    queueToast("You have been logged out.");
    return navigate("/login");
  }

  function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formData.password !== formData.confirmpassword) {
      setChangePasswordError("New password must match");
    }
  }

  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmpassword: "",
  });

  const handleChange = (event: any) => {
    setChangePasswordError("");
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };
  const [changePasswordError, setChangePasswordError] = useState("");

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
                <form
                  className="flex flex-col gap-2 p-2"
                  onSubmit={changePassword}
                >
                  <input
                    className="my-2 p-2 border-2 text-gray-600 rounded focus:border-current focus:ring-0 font-semibold placeholder-gray-400"
                    type="password"
                    name="password"
                    id="password"
                    autoComplete="off"
                    placeholder="new password"
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                  <div className="flex flex-col">
                    <input
                      className="my-2 p-2 border-2 text-gray-600 rounded focus:border-current focus:ring-0 font-semibold placeholder-gray-400"
                      type="password"
                      name="confirmpassword"
                      id="confirmpassword"
                      autoComplete="off"
                      placeholder="confirm password"
                      onChange={handleChange}
                      required
                    />
                    <LocalError error={changePasswordError} />
                  </div>{" "}
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
                <div id="Me" className="font-semibold text-center ">
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
