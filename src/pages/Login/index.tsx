import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import Input from "../../components/Input";
import Button from "../../components/Button";
import styles from "./style.module.scss";
import type { AxiosError } from "axios";

interface LoginFormInputs {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: "student" | "coordinator";
  };
}

interface ApiError {
  error: string;
}

export default function Login() {
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (data: LoginFormInputs) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.post<LoginResponse>("/student/login", data);

      const { user } = response.data;

      localStorage.setItem("@CertificApp:user", JSON.stringify(user));

      if (user.role === "coordinator") {
        navigate("/coordenador");
        return;
      }

      navigate("/aluno");
    } catch (err) {
      const error = err as AxiosError<ApiError>;

      const message =
        error.response?.data?.error ||
        "Falha na autenticação. Verifique os seus dados.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form onSubmit={handleSubmit(handleLogin)} className={styles.card}>
        <div className={styles.header}>
          <h1>Bem-vindo</h1>
          <p>Inicie sessão para gerir as suas horas</p>
        </div>

        {errorMessage && (
          <div className={styles.errorAlert}>{errorMessage}</div>
        )}

        <div className={styles.inputGroup}>
          <Input
            label="Email"
            type="email"
            placeholder="O seu email institucional"
            required
            {...register("email")}
          />
          <Input
            label="Palavra-passe"
            type="password"
            placeholder="A sua palavra-passe"
            required
            {...register("password")}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "A entrar..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
