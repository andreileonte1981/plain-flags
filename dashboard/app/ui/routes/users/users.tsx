import Client from "~/client/client";
import type { Route } from "../../../+types/root";
import { Fragment, useContext, useState } from "react";
import GreenPlusButton from "~/ui/components/reusables/greenPlusButton";
import { redirect, useRevalidator } from "react-router";
import FilterEdit from "../../components/reusables/filterEdit";
import LocalError from "../../components/reusables/localError";
import YesNoWrap from "../../components/reusables/yesnoWrap";
import { ToastContext } from "~/context/toastContext";
import { ModalContext } from "~/context/modalContext";
import { scrollToElement } from "~/utils/scrollTo";
import { Role, type User } from "~/domain/user";
import DeleteUser from "./components/deleteUser";

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

  const [newUserEmails, setNewUserEmails] = useState("");

  const [newUserError, setNewUserError] = useState("");

  function checkValid(): boolean {
    if (!newUserEmails) {
      setNewUserError("At least one user email required");
      return false;
    }
    const emails = newUserEmails.split(",");
    const invalids: string[] = [];
    const emailCheck =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    for (const email of emails) {
      const e = email.trim();
      if (!emailCheck.test(e)) {
        invalids.push(e);
      }

      if (invalids.length) {
        setNewUserError(`Invalid emails: ${invalids.join(", ")}`);
        return false;
      }
    }
    return true;
  }

  const onCreateYes = async () => {
    try {
      const response = await Client.post("users/bulk", {
        emails: newUserEmails,
      });

      queueToast("Users created.");

      await revalidator.revalidate();

      setTimeout(() => {
        scrollToElement(`user_${response.data.id}`, "smooth", "start");
      }, 250);
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "User creation error");
    }
  };

  return (
    <div className="mx-2 flex flex-col">
      <div id="usersHeader" className="sticky top-0 z-10 bg-white">
        <div className="flex flex-col flex-wrap items-center justify-center border-b-4">
          <div
            id="userCreatePanel"
            className="flex items-center justify-between flex-wrap w-full font-semibold text-gray-600 px-3 border-b-4"
          >
            <div className="flex flex-col grow flex-1 items-start my-2">
              <textarea
                id="newUserEmails"
                name="newUserEmails"
                className="border-2 rounded p-1 focus:ring-0 focus:border-current placeholder-gray-300 resize w-full"
                defaultValue={newUserEmails}
                placeholder="New user emails (comma separated)"
                onChange={(e) => {
                  setNewUserError("");
                  setNewUserEmails(e.target.value);
                }}
              />
              <LocalError error={newUserError} />
            </div>
            <YesNoWrap
              clickId="createNewUserButton"
              question={`Create new users?`}
              preDialogValidator={checkValid}
              key={newUserEmails}
              onYes={() => {
                onCreateYes();
              }}
            >
              <div className="flex items-center justify-between">
                <GreenPlusButton
                  id="createNewUserButton"
                  onClick={() => {}}
                  text="Create users"
                />
              </div>
            </YesNoWrap>
          </div>
          <div id="userFilters" className="w-full p-2">
            <FilterEdit
              onChange={(e) => {
                setMailFilter(e.target.value);
              }}
              placeholder="Find user by email"
              tooltip=""
            />
          </div>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-[80%,10%,10%] items-center p-2 text-gray-600">
          {users.map((u) => (
            <Fragment key={`user_${u.id}`}>
              <div className="break-all pb-2" key={`email_${u.id}`}>
                {u.role === Role.ADMIN ? (
                  <span className="font-bold">{u.email}</span>
                ) : (
                  <span>{u.email}</span>
                )}
              </div>
              <div className="pb-2" key={`role_${u.id}`}>
                {u.role === Role.ADMIN ? (
                  <span className="font-bold">{u.role}</span>
                ) : (
                  <span>{u.role}</span>
                )}
              </div>
              <div className="pb-2 flex justify-end" key={`trash_${u.id}`}>
                <DeleteUser id={u.id} email={u.email} role={u.role} />
              </div>
              <div
                key={`separator_${u.id}`}
                className="col-span-3 w-full h-0.5 mb-2 bg-gray-100"
              ></div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
