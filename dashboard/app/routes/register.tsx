import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { ModalContext } from "~/context/modalContext";

export default function Register() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const { showMessage } = useContext(ModalContext);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const url = "http://127.0.0.1:5000/api/users";
      const response = await axios.post(url, formData);

      if (response.status === 201) {
        showMessage("User created.");
        navigate(`../login?email=${formData.email}`);
      }
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "Registration error");
    }
  };

  const handleChange = (event: any) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

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
            className="my-2 p-2 text-gray-600 rounded focus:border-current focus:ring-0 font-semibold placeholder-gray-400"
            type="email"
            id="email"
            name="email"
            placeholder="email"
            onChange={handleChange}
            required
          />
          <input
            className="my-2 p-2 text-gray-600 rounded focus:border-current focus:ring-0 font-semibold placeholder-gray-400"
            type="password"
            name="password"
            id="password"
            autoComplete="off"
            placeholder="password"
            onChange={handleChange}
            required
          />
          <button
            className="flex justify-center items-center m-3 p-3 px-10 border hover:text-white hover:bg-gray-500 active:bg-gray-600 border-gray-500 rounded font-bold text-gray-500"
            type="submit"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
