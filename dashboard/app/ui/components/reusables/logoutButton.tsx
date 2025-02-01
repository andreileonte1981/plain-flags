import LogoutIcon from "../icons/logoutIcon";

export default function LogoutButton(props: { clickId: string }) {
  return (
    <div
      id={props.clickId}
      className="hover:bg-gray-300 active:bg-gray-200 border-gray-400 ml-5 mr-5 text-center rounded cursor-pointer hover:scale-105 text-gray-600 hover:text-red-800"
    >
      <div className="flex justify-center items-center">
        <span className="mr-1 font-semibold">Logout</span>
        <LogoutIcon />
      </div>
    </div>
  );
}
