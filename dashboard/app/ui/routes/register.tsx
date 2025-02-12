import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import Client from "~/client/client";
import { ModalContext } from "~/context/modalContext";
import { ToastContext } from "~/context/toastContext";
import LocalError from "../components/reusables/localError";
import PasswordEdit from "../components/reusables/passwordEdit";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmpassword: "",
  });

  const { showMessage } = useContext(ModalContext);
  const { queueToast } = useContext(ToastContext);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.password !== formData.confirmpassword) {
      setRegistrationError("Password must match");
      return;
    }

    try {
      const response = await Client.post("users", {
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201) {
        queueToast("User created. Please log in");
        navigate(`/login?email=${formData.email}`);
      }
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "Registration error");
    }
  };

  const handleChange = (event: any) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setRegistrationError("");
  };

  const [registrationError, setRegistrationError] = useState("");

  return (
    <div className="bg-gray-800 w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col items-center min-h-52 bg-gray-100 rounded p-4 mb-52">
        <h1 className="my-3 font-bold uppercase text-gray-500">Plain Flags</h1>
        <div className="h-1 w-full rounded bg-black/5 m-2"></div>
        <h1 className="text-xs mb-3 text-gray-400">register new user</h1>

        <form
          className="flex flex-col"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <input
            className="my-2 p-2 text-gray-600 text-sm border-2 rounded focus:border-current focus:ring-0 font-semibold placeholder-gray-400"
            type="email"
            id="email"
            name="email"
            placeholder="email"
            onChange={handleChange}
            required
            autoFocus
          />
          <PasswordEdit
            id="password"
            placeholder="password"
            handleChange={handleChange}
            defaultValue={formData.password}
            error=""
          />
          <PasswordEdit
            id="confirmpassword"
            placeholder="confirm password"
            handleChange={handleChange}
            defaultValue={formData.confirmpassword}
            error={registrationError}
          />
          <button
            className="flex justify-center items-center m-3 p-3 px-10 border hover:text-white hover:bg-gray-500 active:bg-gray-600 border-gray-500 rounded font-bold text-gray-500"
            type="submit"
          >
            Register
          </button>
        </form>
        <Link
          className="mt-4 text-xs text-gray-500 font-semibold hover:text-red-600"
          to="/login"
        >
          back to login
        </Link>
      </div>
    </div>
  );
}
