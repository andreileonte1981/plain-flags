import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { ModalContext } from "~/context/modalContext";

export default function Register() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const { isOpen, setIsOpen, message, setMessage } = useContext(ModalContext);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const url = "http://127.0.0.1:5000/api/users";
      const response = await axios.post(url, formData);

      if (response.status === 201) {
        navigate("../login");
      }
    } catch (error: any) {
      // debugger;

      // TODO: try to write a utility that makes this available in one line, including the useContext garbage above
      setMessage(error.response?.data?.message || "Registration error");
      setIsOpen(true);
    }
  };

  const handleChange = (event: any) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <label htmlFor="email">email</label>
      <input
        type="email"
        id="email"
        name="email"
        onChange={handleChange}
        required
      />
      <label htmlFor="password">password</label>
      <input
        type="password"
        name="password"
        id="password"
        autoComplete="off"
        onChange={handleChange}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
}
