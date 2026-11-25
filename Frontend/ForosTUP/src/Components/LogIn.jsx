import ValidationMessage from "./ValidationMessage.jsx";
import { useFieldValidation } from "../hooks/useFieldValidation.js";
import { submissionError, validateEmail } from "../Services/UtilityServices/formValidation.js";
import { useState } from "react";
import { Alert } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authenticate, getCurrentUser } from "../Services/userService.js";
import { useAuth } from "../context/AuthContext.jsx";

function loginError(error) {
  if (error.status === 401) {
    const details = error.details;
    if (details?.code === "access_restricted") {
      const seconds = details.remainingSeconds;
      if (!Number.isFinite(seconds) || seconds <= 0) return "Acceso restringido.";
      if (seconds < 86400) return "Acceso restringido. Queda menos de 1 día.";
      if (seconds === 86400) return "Acceso restringido. Queda 1 día.";
      return `Acceso restringido. Quedan ${Math.ceil(seconds / 86400)} días.`;
    }
    return "Correo o contraseña incorrectos.";
  }
  return submissionError(error, "Ocurrió un error al iniciar sesión. Intentá de nuevo en unos minutos.");
}

export default function LogIn() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState(state?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validation = useFieldValidation({
    email: validateEmail(email),
    password: password.trim() ? "" : "Ingresá tu contraseña.",
  }, "login");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!validation.submit(event.currentTarget)) return;
    setLoading(true);
    try {
      const token = await authenticate(email, password);
      login(await getCurrentUser(token), token);
      navigate(state?.from || "/main", { replace: true });
    } catch (error) {
      setError(loginError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="salvia-auth">
      <section className="salvia-panel salvia-auth-card" aria-labelledby="login-title">
        <h1 id="login-title">Iniciar sesión</h1>
        <p className="salvia-lede">Entrá para participar en los foros.</p>
        {state?.registered && <Alert variant="success">Cuenta creada. Ya podés iniciar sesión.</Alert>}
        <ValidationMessage notice>{error}</ValidationMessage>
        <form className="salvia-form" onSubmit={handleSubmit} noValidate>
          <div className="salvia-form-field">
            <label htmlFor="login-email">Correo electrónico <span aria-hidden="true">*</span></label>
            <input {...validation.field("email")} name="correo" className="form-control" type="email" autoComplete="email"
              value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} required />
            <ValidationMessage id="login-email-error">{validation.show("email")}</ValidationMessage>
          </div>
          <div className="salvia-form-field">
            <label htmlFor="login-password">Contraseña <span aria-hidden="true">*</span></label>
            <div className="salvia-password">
              <input {...validation.field("password")} name="password" className="form-control"
                type={showPassword ? "text" : "password"} autoComplete="current-password"
                value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} required />
              <button className="salvia-password-toggle" type="button" aria-controls="login-password"
                onClick={() => setShowPassword((visible) => !visible)}>
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <ValidationMessage id="login-password-error">{validation.show("password")}</ValidationMessage>
          </div>
          <button className="btn salvia-primary salvia-auth-submit" disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
        <p className="salvia-auth-footer">¿Todavía no tenés cuenta? <Link to="/register" state={{ from: state?.from }}>Crear cuenta</Link></p>
      </section>
    </main>
  );
}
