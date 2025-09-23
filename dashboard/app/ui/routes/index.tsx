import { redirect, useNavigate } from "react-router";
import type { Route } from "../../+types/root";
import Client from "~/client/client";
import PasswordEdit from "../components/reusables/passwordEdit";
import { useContext, useState } from "react";
import { ModalContext } from "~/context/modalContext";
import { ToastContext } from "~/context/toastContext";
import { sleep } from "~/utils/sleep";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Plain Flags" },
    { name: "description", content: "Activate your features in production" },
  ];
}

export async function clientLoader({}) {
  const apiUrl = localStorage.getItem("apiurl");
  if (apiUrl) {
    Client.setApiUrl(apiUrl);

    return redirect("/flags");
  }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { showMessage } = useContext(ModalContext);
  const { queueToast } = useContext(ToastContext);

  const [formData, setFormData] = useState({
    apiurl: "",
    passkey: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      Client.setApiUrl(`${formData.apiurl}/api/`);

      const response = await Client.post("dashauth", {
        passkey: formData.passkey,
      });

      if (response.status === 200) {
        localStorage.setItem("apiurl", `${formData.apiurl}/api/`);

        queueToast("Back end check successful!");

        await sleep(1000);

        navigate("/flags");
      }
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "Auth error");
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
          <input
            className="my-2 p-2 text-gray-600 font-semibold text-sm border-2 rounded focus:border-current focus:ring-0 placeholder-gray-400"
            type="text"
            id="apiurl"
            name="apiurl"
            placeholder="https://plainflags.yourdomain.com/api/"
            spellCheck={false}
            onChange={handleChange}
            required
          />
          <PasswordEdit
            placeholder="passkey"
            handleChange={handleChange}
            id="passkey"
            defaultValue={formData.passkey}
            error=""
          />
          <button
            className="flex justify-center items-center m-3 p-3 border-2 hover:text-white hover:bg-gray-500 active:bg-gray-600 border-gray-500 rounded font-bold text-gray-500"
            type="submit"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
