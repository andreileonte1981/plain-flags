import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Register() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const url = "http://127.0.0.1:5000/api/users";
      const response = await axios.post(url, formData);

      if (response.status === 201) {
        navigate("../login");
      }
    } catch (error) {
      debugger;
      console.debug(error);
      alert(error || "Registration error");
    }
  };

  const handleChange = (event: any) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <label htmlFor="email">
        <input type="text" name="email" onChange={handleChange} />
      </label>
      <label htmlFor="password">
        <input
          type="password"
          name="password"
          autoComplete="off"
          onChange={handleChange}
        />
      </label>
      <button type="submit">Register</button>
    </form>
  );
}
