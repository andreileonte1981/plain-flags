import { useContext, useState } from "react";
import { ModalContext } from "~/context/modalContext";
import { ToastContext } from "~/context/toastContext";
import { sleep } from "~/utils/sleep";
import type { Route } from "../+types";
import Client from "~/client/client";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Plain Flags" },
    { name: "description", content: "Activate your features in production" },
  ];
}

export async function clientLoader({}) {}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { showMessage } = useContext(ModalContext);
  const { queueToast } = useContext(ToastContext);

  const [formData, setFormData] = useState({
    name: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      Client.setApiUrl(`${import.meta.env.VITE_DEMO_API_URL}/api/`);
      localStorage.setItem(
        "apiurl",
        `${import.meta.env.VITE_DEMO_API_URL}/api/`
      );
      localStorage.setItem("isDemo", "true");

      const response = await Client.post("dashauth/demo", {
        name: formData.name,
      });
      if (response.status === 201) {
        localStorage.setItem("jwt", response.data.token);
        localStorage.setItem("email", response.data.user.email);
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("tempPassword", response.data.user.tempPassword);

        queueToast("Demo account created! Welcome");
        await sleep(1000);
        navigate("/demo/success");
      }
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "Demo connection error");
    }
  };

  const handleChange = (event: any) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <div className="bg-gray-800 w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col items-center min-h-52 bg-gray-100 rounded p-4 mb-40 w-96">
        <img src="/images/logo.svg" alt="logo" className="w-12 h-12" />
        <h1 className="my-3 font-bold uppercase text-gray-500">Plain Flags</h1>
        <div className="h-1 w-full rounded bg-black/5 m-2"></div>
        <h1 className="text-xs mb-3 text-gray-400">
          welcome, please authenticate with backend service
        </h1>
        <form className="flex flex-col w-full" onSubmit={handleSubmit}>
          <label htmlFor="name" className="text-gray-500 font-semibold text-sm">
            Your Name (optional)
          </label>
          <input
            className="my-2 p-2 text-gray-600 font-semibold text-sm border-2 rounded focus:border-current focus:ring-0 placeholder-gray-400"
            type="text"
            id="name"
            name="name"
            placeholder="John A. Doe"
            spellCheck={false}
            onChange={handleChange}
          />
          <button
            className="flex justify-center items-center my-3 p-3 border-2 hover:text-white hover:bg-gray-500 active:bg-gray-600 border-gray-500 rounded font-bold text-gray-500"
            type="submit"
          >
            Continue To Demo
          </button>
        </form>

        <button
          onClick={() => {
            navigate("/");
          }}
          className="w-full p-3 border-2 hover:text-white hover:bg-gray-500 active:bg-gray-600 border-gray-500 rounded font-bold text-gray-500"
        >
          Connect To Real Backend
        </button>
      </div>
    </div>
  );
}
