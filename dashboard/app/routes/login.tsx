import axios from "axios";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
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
      const url = "http://127.0.0.1:5000/api/users/login";
      const response = await axios.post(url, formData);

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
            className="flex justify-center items-center m-3 p-3 pl-10 border hover:text-white hover:bg-gray-500 active:bg-gray-600 border-gray-500 rounded font-bold text-gray-500"
            type="submit"
          >
            Log in
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4 mx-1"
            >
              <path
                fill-rule="evenodd"
                d="M2 8c0 .414.336.75.75.75h8.69l-1.22 1.22a.75.75 0 1 0 1.06 1.06l2.10-2.5a.75.75 0 0 0 0-1.06l-2.10-2.5a.75.75 0 1 0-1.06 1.06l1.22 1.22H2.75A.75.75 0 0 0 2 8Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </form>
        <div className="h-1 w-full rounded bg-black/5 m-2"></div>
        <Link
          className="text-red-700 hover:underline hover:text-red-600"
          to="/register"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
