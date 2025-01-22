import axios from "axios";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import Client from "~/client/client";
import { ModalContext } from "~/context/modalContext";
import useQueryParams from "~/hooks/useQueryParams";

export default function Login() {
  const { showMessage } = useContext(ModalContext);

  const navigate = useNavigate();
  const queryParams = useQueryParams();

  const [formData, setFormData] = useState({
    email: queryParams.email || "",
    password: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await Client.post("users/login", formData);

      if (response.status === 200) {
        localStorage.setItem("jwt", response.data.token);

        navigate("..");
      }
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "Login error");
    }
  };

  const handleChange = (event: any) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <div className="bg-gray-800 w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col items-center min-h-52 bg-gray-100 rounded p-4 mb-40">
        <h1 className="my-3 font-bold uppercase text-gray-500">Plain Flags</h1>
        <div className="h-1 w-full rounded bg-black/5 m-2"></div>
        <h1 className="text-xs mb-3 text-gray-400">welcome, please log in</h1>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <input
            className="my-2 p-2 text-gray-600 rounded focus:border-current focus:ring-0 placeholder-gray-400"
            type="email"
            name="email"
            placeholder="email"
            onChange={handleChange}
            required
            defaultValue={queryParams.email}
          />
          <input
            className="my-2 p-2 text-gray-600 rounded focus:border-current focus:ring-0 placeholder-gray-400"
            type="password"
            name="password"
            placeholder="password"
            onChange={handleChange}
            required
          />
          <button
            className="flex justify-center items-center m-3 p-3 border hover:text-white hover:bg-gray-500 active:bg-gray-600 border-gray-500 rounded font-bold text-gray-500"
            type="submit"
          >
            Log in
          </button>
        </form>
        <div className="h-1 w-full rounded bg-black/5 m-2"></div>
        <Link
          className="text-red-700 text-sm font-semibold hover:underline hover:text-red-600"
          to="/register"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
