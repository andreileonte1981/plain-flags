import { useContext, useState } from "react";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import { ModalContext } from "~/context/modalContext";
import { ToastContext } from "~/context/toastContext";
import { Role, type User } from "~/domain/user";
import TrashIcon from "~/ui/components/icons/trashIcon";
import YesNoWrap from "~/ui/components/reusables/yesnoWrap";

export default function DeleteUser(props: User) {
  const ynElementId = `yn${props.id}`;
  const [deleteWaitOpen, setDeleteWaitOpen] = useState(false);

  const { showMessage } = useContext(ModalContext);
  const { queueToast } = useContext(ToastContext);

  const revalidator = useRevalidator();

  async function deleteUser() {
    try {
      setDeleteWaitOpen(true);

      await Client.post("users/delete", {
        id: props.id,
      });

      setDeleteWaitOpen(false);

      revalidator.revalidate();

      queueToast("User deleted.");
    } catch (error: any) {
      // debugger;
      setDeleteWaitOpen(false);

      showMessage(error.response?.data?.message || "User deletion error");
    }
  }

  let reason = "";
  function setReason(s: string) {
    reason = s;
  }

  function mayDelete(): boolean {
    const myRole = localStorage.getItem("role");
    const myEmail = localStorage.getItem("email");

    if (props.role === Role.SUPERADMIN) {
      setReason(`Cannot delete super admin`);
      return false;
    }

    if (myRole === Role.SUPERADMIN) {
      return true;
    }

    if (props.email === myEmail) {
      setReason("Cannot delete yourself");
      return false;
    }

    if (myRole === Role.ADMIN || myRole === Role.SUPERADMIN) {
      return true;
    }

    setReason("Not allowed");

    return false;
  }

  const mayDeleteUser = mayDelete();

  return (
    <YesNoWrap
      clickId={`ynDeleteUser_${props.id}`}
      question={`Delete ${props.role} ${props.email}?`}
      onYes={() => {
        deleteUser();
      }}
      id={ynElementId}
    >
      {mayDeleteUser ? (
        <>
          {deleteWaitOpen && <div className="animate-bounce">Deleting...</div>}
          {!deleteWaitOpen && (
            <div
              className="border-2 border-gray-500 rounded p-1 font-bold hover:bg-gray-600 hover:text-white active:scale-95"
              id={`ynDeleteUser_${props.id}`}
            >
              <TrashIcon />
            </div>
          )}
        </>
      ) : (
        <div className="relative group border-2 border-gray-200 text-gray-200 rounded p-1 font-bold cursor-not-allowed">
          <TrashIcon />

          <div className="absolute invisible group-hover:visible transition-opacity duration-300 opacity-0 group-hover:opacity-100 p-2 m-1 bg-black/90 rounded -top-2 -left-44 text-white text-sm font-bold">
            {reason}
          </div>
        </div>
      )}
    </YesNoWrap>
  );
}
