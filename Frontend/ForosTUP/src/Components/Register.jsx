import { useState } from "react";
import ValidationMessage from "./ValidationMessage.jsx";
import { useFieldValidation } from "../hooks/useFieldValidation.js";
import { submissionError, validateBirthDate, validateEmail } from "../Services/UtilityServices/formValidation.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authenticate, createUser, getCurrentUser } from "../Services/userService.js";
import { showSuccessToast } from "../Services/UtilityServices/successToast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

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
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", dateOfBirth: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validation = useFieldValidation({
    name: form.name.trim() ? "" : "Ingresá tu nombre.",
    email: validateEmail(form.email),
    dateOfBirth: validateBirthDate(form.dateOfBirth),
    password: form.password.trim() ? "" : "Ingresá tu contraseña.",
    confirmPassword: !form.confirmPassword ? "Confirmá tu contraseña." :
      form.password !== form.confirmPassword ? "Las contraseñas no coinciden." : "",
  }, "register");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (!validation.submit(event.currentTarget)) return;

    setLoading(true);
    let accountCreated = false;
    try {
      await createUser(form);
      accountCreated = true;
      const token = await authenticate(form.email, form.password);
      login(await getCurrentUser(token), token);
      showSuccessToast("Cuenta creada correctamente.");
      navigate("/main", { replace: true });
    } catch (error) {
      if (accountCreated) {
        navigate("/login", { replace: true, state: { email: form.email.trim(), registered: true } });
      } else if (error.status === 400 && error.message === "Email is already registered.") {
        validation.report("email", "Este correo ya está registrado.");
        document.getElementById("register-email")?.focus();
      } else {
        setError(submissionError(error, "No pudimos crear la cuenta. Revisá los datos e intentá de nuevo."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="salvia-auth">
      <section className="salvia-panel salvia-auth-card salvia-register-card" aria-labelledby="register-title">
        <h1 id="register-title">Crear cuenta</h1>
        <ValidationMessage notice>{error}</ValidationMessage>
        <form className="salvia-form" onSubmit={handleSubmit} noValidate>
          <div className="salvia-register-fields">
            {fields.map(({ name, label, type, autoComplete }) => (
              <div key={name} className={name === "dateOfBirth" ? "salvia-full-field" : undefined}>
                <label htmlFor={`register-${name}`}>{label} <span aria-hidden="true">*</span></label>
                <input {...validation.field(name)} name={name} className="form-control" type={type}
                  autoComplete={autoComplete} value={form[name]} required
                  onChange={(event) => {
                    setForm({ ...form, [name]: event.target.value });
                    setError("");
                  }} />
                <ValidationMessage id={`register-${name}-error`}>{validation.show(name)}</ValidationMessage>
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
