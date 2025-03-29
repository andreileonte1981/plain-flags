import { useContext, useState } from "react";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import { ModalContext } from "~/context/modalContext";
import { ToastContext } from "~/context/toastContext";
import { Role } from "~/domain/user";
import GreenPlusButton from "~/ui/components/reusables/greenPlusButton";
import LocalError from "~/ui/components/reusables/localError";
import YesNoWrap from "~/ui/components/reusables/yesnoWrap";
import { emailCheck } from "~/utils/emailCheck";

export default function CreateAdminPanel() {
  const { showMessage } = useContext(ModalContext);
  const { queueToast } = useContext(ToastContext);
  const revalidator = useRevalidator();

  const [newAdminEmail, setNewAdminEmail] = useState("");

  const [newUserError, setNewUserError] = useState("");

  function checkValid(): boolean {
    if (!newAdminEmail) {
      setNewUserError("New admin email required");
      return false;
    }

    const e = newAdminEmail.trim();
    if (!emailCheck.test(e)) {
      setNewUserError(`Invalid email address`);
      return false;
    }

    return true;
  }

  const onCreateYes = async () => {
    try {
      const response = await Client.post("users/bulk", {
        emails: newAdminEmail,
        role: Role.ADMIN,
      });

      queueToast("Admin created.");

      setNewAdminEmail("");

      await revalidator.revalidate();
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "Admin user creation error");
    }
  };

  return (
    <div
      id="adminCreatePanel"
      className="flex items-center justify-between flex-wrap gap-2 w-full font-semibold text-gray-600 px-3 border-b-4"
    >
      <div className="flex flex-col grow flex-1 items-start my-2">
        <input
          id="newAdminEmail"
          name="newAdminEmail"
          type="email"
          className="border-2 rounded p-1 focus:ring-0 focus:border-current placeholder-gray-300 resize w-full"
          value={newAdminEmail}
          placeholder="New admin email"
          onChange={(e) => {
            setNewUserError("");
            setNewAdminEmail(e.target.value);
          }}
        />
        <LocalError error={newUserError} />
      </div>
      <YesNoWrap
        clickId="createNewAdminButton"
        question={`Create new admin ${newAdminEmail}?`}
        preDialogValidator={checkValid}
        key={newAdminEmail}
        onYes={() => {
          onCreateYes();
        }}
      >
        <div className="flex items-center justify-between">
          <GreenPlusButton
            id="createNewAdminButton"
            onClick={() => {}}
            text="Create admin"
          />
        </div>
      </YesNoWrap>
    </div>
  );
}
