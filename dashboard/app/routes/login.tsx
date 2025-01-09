import axios from "axios";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ModalContext } from "~/context/modalContext";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const { showMessage } = useContext(ModalContext);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const url = "http://127.0.0.1:5000/api/users/login";
      const response = await axios.post(url, formData);

      if (response.status === 200) {
        localStorage.setItem("jwt", response.data.token);

        navigate("..");
      }
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "Login error");
    }
  };

  const handleChange = (event: any) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">
          <input type="email" name="email" onChange={handleChange} />
        </label>
        <label htmlFor="password">
          <input type="password" name="password" onChange={handleChange} />
        </label>
        <button type="submit">Log in</button>
      </form>
      <Link to="/register">Register</Link>
    </>
  );
}
