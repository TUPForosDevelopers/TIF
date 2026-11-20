import { useState } from "react";
import { Alert } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authenticate, getCurrentUser } from "../Services/userService.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LogIn() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState(state?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await authenticate(email, password);
      login(await getCurrentUser(token), token);
      navigate(state?.from || "/main", { replace: true });
    } catch (error) {
      setError(error.message);
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
        {error && <Alert variant="danger">{error}</Alert>}
        <form className="salvia-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Correo electrónico</label>
          <input id="login-email" name="correo" className="form-control" type="email" autoComplete="email"
            value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="login-password">Contraseña</label>
          <div className="salvia-password">
            <input id="login-password" name="password" className="form-control"
              type={showPassword ? "text" : "password"} autoComplete="current-password"
              value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button className="salvia-password-toggle" type="button" aria-controls="login-password"
              onClick={() => setShowPassword((visible) => !visible)}>
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
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
