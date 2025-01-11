import LogoutIcon from "./icons/logoutIcon";

export default function LogoutButton(props: { handleLogout: () => void }) {
  return (
    <div
      onClick={props.handleLogout}
      className="hover:border border-gray-400 ml-5 mr-5 text-center rounded cursor-pointer hover:shadow-inner hover:shadow-gray-200 hover:scale-105"
    >
      <div className="flex justify-center items-center">
        <span className="mr-1 text-gray-600 font-semibold">Logout</span>
        <LogoutIcon />
      </div>
    </div>
  );
}
