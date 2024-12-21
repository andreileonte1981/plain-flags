import { Link } from "react-router";

export default function Login() {
  return (
    <>
      <form>
        <label htmlFor="Email">
          <input type="text" />
        </label>
        <label htmlFor="Password">
          <input type="password" />
        </label>
        <button type="submit">Log in</button>
      </form>
      <Link to="/register">Register</Link>
      </>
  );
}
