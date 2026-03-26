import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { logout, getFirebaseAuth } from "~/firebase";
import FlagIcon from "~/ui/icons/flagIcon";
import UsersIcon from "~/ui/icons/usersIcon";
import UserIcon from "~/ui/icons/userIcon";
import LogoutIcon from "~/ui/icons/logoutIcon";

function NavItem({
  to,
  tooltip,
  children,
}: {
  to: string;
  tooltip: string;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const isActive = location.pathname.startsWith("/" + to.replace(/^\//, ""));
  return (
    <div
      className={`group relative flex items-center justify-end m-1 border-b-4 md:border-b-0 md:border-r-4 ${isActive ? "border-gray-800" : "border-transparent"}`}
    >
      <Link
        to={to}
        className="flex flex-row items-center justify-end gap-1 font-semibold text-gray-500 text-right hover:text-red-500 px-2 py-1"
      >
        <div className="ml-2 mr-2 flex-none">{children}</div>
      </Link>
      <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-max p-2 bg-black/90 rounded left-full text-white text-sm font-bold z-50">
        {tooltip}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  const role = user
    ? (user as any).reloadUserInfo?.customAttributes
      ? JSON.parse((user as any).reloadUserInfo.customAttributes)?.role
      : null
    : null;

  // role is stored in localStorage after login
  const storedRole =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const isAdmin = storedRole === "admin" || storedRole === "superadmin";

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("role");
      localStorage.removeItem("email");
    }
    navigate("/login");
  }

  return (
    <div className="flex md:flex-row flex-col items-stretch w-full min-h-screen">
      <div id="sidebar" className="flex-none md:w-52 md:h-screen h-12 m-0 z-20">
        <div className="fixed md:w-52 md:h-full h-12 left-0 right-0 top-0 md:flex md:flex-col justify-between md:border-r-4 bg-white">
          <div
            id="titleLogo"
            className="md:flex hidden items-center justify-center gap-2"
          >
            <img src="/images/logo.svg" alt="logo" className="p-8" />
          </div>

          <div className="md:block hidden w-48 ml-2 h-1 bg-slate-500/25 rounded"></div>

          <div className="h-full flex md:flex-col md:justify-between justify-between">
            <div className="pt-2 flex justify-around md:flex-col md:justify-start gap-2 md:items-stretch items-center">
              <NavItem to="/flags" tooltip="Control your features here">
                <div className="text-green-600">
                  <FlagIcon />
                </div>
              </NavItem>
              {isAdmin && (
                <NavItem
                  to="/users"
                  tooltip="Create and delete users (admin only)"
                >
                  <div className="text-gray-500">
                    <UsersIcon />
                  </div>
                </NavItem>
              )}
            </div>

            {/* User section */}
            <div className="md:block hidden my-2 mx-2">
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-gray-500 hover:text-red-500 font-semibold text-sm w-full justify-end pr-2"
                >
                  <span className="text-xs truncate max-w-32">
                    {typeof window !== "undefined"
                      ? localStorage.getItem("email") || ""
                      : ""}
                  </span>
                  <UserIcon />
                </button>
                {userMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white border rounded shadow-lg p-2 min-w-32">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-gray-600 hover:text-red-500 text-sm font-semibold w-full"
                    >
                      <LogoutIcon />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile user icon */}
            <div
              className="md:hidden m-3 bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <UserIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile user menu overlay */}
      {userMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setUserMenuOpen(false)}
        >
          <div
            className="absolute top-12 right-4 bg-white rounded shadow-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-gray-500 mb-2">
              {typeof window !== "undefined"
                ? localStorage.getItem("email") || ""
                : ""}
            </p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-500 text-sm font-semibold"
            >
              <LogoutIcon />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-50 bg-opacity-25 flex-auto">
        <Outlet />
      </div>
    </div>
  );
}
