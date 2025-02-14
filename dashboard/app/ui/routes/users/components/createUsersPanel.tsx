import { useContext, useState } from "react";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import { ModalContext } from "~/context/modalContext";
import { ToastContext } from "~/context/toastContext";
import GreenPlusButton from "~/ui/components/reusables/greenPlusButton";
import LocalError from "~/ui/components/reusables/localError";
import YesNoWrap from "~/ui/components/reusables/yesnoWrap";

export default function CreateUsersPanel() {
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
    const emails = newUserEmails.split(",").filter((e) => e.trim().length > 0);
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
    setNewUserEmails(emails.join(","));
    return true;
  }

  const onCreateYes = async () => {
    try {
      const response = await Client.post("users/bulk", {
        emails: newUserEmails,
      });

      queueToast("Users created.");

      setNewUserEmails("");

      await revalidator.revalidate();
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "User creation error");
    }
  };

  return (
    <div
      id="userCreatePanel"
      className="flex items-center justify-between flex-wrap w-full font-semibold text-gray-600 px-3 border-b-4"
    >
      <div className="flex flex-col grow flex-1 items-start my-2">
        <textarea
          id="newUserEmails"
          name="newUserEmails"
          className="border-2 rounded p-1 focus:ring-0 focus:border-current placeholder-gray-300 resize w-full"
          value={newUserEmails}
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
  );
}
