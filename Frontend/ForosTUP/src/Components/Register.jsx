import { useState } from "react";
import { Alert } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createUser } from "../Services/userService.js";

const fields = [
  { name: "name", label: "Nombre", type: "text", autoComplete: "name" },
  { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email" },
  { name: "dateOfBirth", label: "Fecha de nacimiento", type: "date", autoComplete: "bday" },
  { name: "password", label: "Contraseña", type: "password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirmar contraseña", type: "password", autoComplete: "new-password" },
];

export default function Register() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ name: "", email: "", dateOfBirth: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await createUser(form);
      navigate("/login", { replace: true, state: { email: form.email.trim(), from: state?.from, registered: true } });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="salvia-auth">
      <section className="salvia-panel salvia-auth-card salvia-register-card" aria-labelledby="register-title">
        <h1 id="register-title">Crear cuenta</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        <form className="salvia-form" onSubmit={handleSubmit}>
          <div className="salvia-register-fields">
            {fields.map(({ name, label, type, autoComplete }) => (
              <div key={name} className={name === "dateOfBirth" ? "salvia-full-field" : undefined}>
                <label htmlFor={`register-${name}`}>{label}</label>
                <input id={`register-${name}`} name={name} className="form-control" type={type}
                  autoComplete={autoComplete} value={form[name]} required
                  onChange={(event) => setForm({ ...form, [name]: event.target.value })} />
              </div>
            ))}
          </div>
          <button className="btn salvia-primary salvia-auth-submit" disabled={loading}>
            {loading ? "Registrando…" : "Registrarme"}
          </button>
        </form>
        <p className="salvia-auth-footer">¿Ya tenés cuenta? <Link to="/login" state={{ from: state?.from }}>Iniciar sesión</Link></p>
      </section>
    </main>
  );
}
