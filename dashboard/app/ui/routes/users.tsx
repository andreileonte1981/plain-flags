import Client from "~/client/client";
import type { Route } from "../../+types/root";
import { useContext, useState } from "react";
import GreenPlusButton from "~/ui/components/reusables/greenPlusButton";
import { redirect, useRevalidator } from "react-router";
import FilterEdit from "../components/reusables/filterEdit";
import LocalError from "../components/reusables/localError";
import YesNoWrap from "../components/reusables/yesnoWrap";
import { ToastContext } from "~/context/toastContext";
import { ModalContext } from "~/context/modalContext";
import { scrollToElement } from "~/utils/scrollTo";
import type { User } from "~/domain/user";

export async function clientLoader({}) {
  if (localStorage.getItem("role") !== "admin") {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    alert("Unauthorized");

    window.location.reload();
  }

  if (!localStorage.getItem("jwt")) {
    return redirect("/login");
  }

  const response = await Client.get("users");

  return response?.data;
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const unfilteredUsers: User[] | undefined = loaderData as User[] | undefined;

  if (!unfilteredUsers) {
    return <div>Loading...</div>;
  }

  const [mailFilter, setMailFilter] = useState("");

  const users = unfilteredUsers.filter(
    (u) => u.email.toLowerCase().indexOf(mailFilter.toLowerCase()) >= 0
  );

  const { showMessage } = useContext(ModalContext);
  const { queueToast } = useContext(ToastContext);
  const revalidator = useRevalidator();
  function checkValid(): boolean {
    if (!newFlagName) {
      setNewFlagError("New flag name required");
      return false;
    }
    return true;
  }

  const onCreateYes = async () => {
    try {
      const response = await Client.post("flags", { name: newFlagName });

      queueToast("Flag created.");

      await revalidator.revalidate();

      setTimeout(() => {
        scrollToElement(`user_${response.data.id}`, "smooth", "start");
      }, 250);
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "Flag creation error");
    }
  };

  const [newFlagName, setNewFlagName] = useState("");

  const [newFlagError, setNewFlagError] = useState("");

  return (
    <div className="mx-2 flex flex-col">
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex flex-col flex-wrap items-center justify-center border-b-4 py-2">
          <div className="flex items-center justify-between flex-wrap font-semibold text-gray-600 px-3 border-b-4 py-2">
            <div className="flex flex-col items-end my-2 mx-1">
              <div>
                <input
                  id="newFlagName"
                  name="newFlagName"
                  type="text"
                  className="border-2 rounded p-1 w-auto focus:ring-0 focus:border-current placeholder-gray-300"
                  defaultValue={newFlagName}
                  placeholder="New flag name"
                  onChange={(e) => {
                    setNewFlagError("");
                    setNewFlagName(e.target.value);
                  }}
                />
                <LocalError error={newFlagError} />
              </div>
            </div>
            <YesNoWrap
              clickId="createNewFlagButton"
              question={`Create new flag '${newFlagName}'?`}
              preDialogValidator={checkValid}
              key={newFlagName}
              onYes={() => {
                onCreateYes();
              }}
            >
              <div className="flex items-center justify-between">
                <GreenPlusButton
                  id="createNewFlagButton"
                  onClick={() => {
                    /* When wrapped by a Yes/No with corresponding clickId, do nothing */
                  }}
                  text="Create"
                />
              </div>
            </YesNoWrap>
          </div>{" "}
          <FilterEdit
            onChange={(e) => {
              setMailFilter(e.target.value);
            }}
            placeholder="Find user by email"
            tooltip=""
          />
        </div>
      </div>
      <div>
        <ul>
          {users.map((u) => (
            <li key={`user_${u.id}`}>{u.email}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
