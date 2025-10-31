import FlagIcon from "~/ui/components/icons/flagIcon";
import type { Route } from "../+types";

export default function Component({}: Route.ComponentProps) {
  return (
    <div className="flex flex-col items-center text-gray-500 font-semibold p-8 text-center">
      <p className="flex gap-2 items-center my-8 text-green-700">
        <div className="text-gray-500 text-lg">
          Thank you for trying
          <br />
          <span className="font-bold">Plain Flags</span>
        </div>
      </p>
      <p>Your demo user email is {localStorage.getItem("email")}</p>
      <p>(It is not a real email address.)</p>
      <p>You can use these demo credentials to log in later if you wish.</p>
      <p>
        Please note that demo user accounts may be deleted after a couple of
        days.
      </p>
      <p>
        Your demo user temporary password is '
        {localStorage.getItem("tempPassword")}'
      </p>
      <p className="mt-2">
        You can change your demo password from the current user section.
      </p>
      <p className="mt-8">
        Go to the flags section to create and control demo features
      </p>
      <p>
        Go to the constraints section to manage some feature constraints, such
        as test users, region etc.
      </p>
    </div>
  );
}
