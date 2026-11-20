import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { createForum } from "../Services/forumService.js";
import { submissionError, validateForum } from "../Services/UtilityServices/formValidation.js";
import { showSuccessToast } from "../Services/UtilityServices/successToast.jsx";
import { useFieldValidation } from "../hooks/useFieldValidation.js";
import ForumFields from "./ForumFields.jsx";
import ValidationMessage from "./ValidationMessage.jsx";

export default function NewForum() {
  const navigate = useNavigate();
  const { isAdmin, token } = useAuth();
  const [form, setForm] = useState({ name: "", desc: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const validation = useFieldValidation(validateForum(form), "new-forum");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!isAdmin || !validation.submit(event.currentTarget)) return;
    setLoading(true);
    try {
      await createForum(form, token);
      showSuccessToast("Foro creado correctamente.");
      navigate("/foros");
    } catch (error) {
      setError(submissionError(error, error.status === 403 ?
        "No tenés permisos para crear foros." : "No pudimos crear el foro. Volvé a intentar."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="salvia-container salvia-compose">
      <nav className="salvia-breadcrumb" aria-label="Ubicación">
        <Link to="/foros">Foros</Link><span aria-hidden="true">/</span><span aria-current="page">Crear foro</span>
      </nav>
      <section className="salvia-panel">
        <h1 className="salvia-title">Crear foro</h1>
        <ValidationMessage notice>{isAdmin ? error : "No tenés permisos para crear foros."}</ValidationMessage>
        {isAdmin && (
          <form className="salvia-form" onSubmit={handleSubmit} noValidate>
            <ForumFields values={form} validation={validation} onChange={(values) => { setForm(values); setError(""); }} />
            <div className="salvia-editor-actions">
              <Link className="btn salvia-secondary" to="/foros">Cancelar</Link>
              <button className="btn salvia-primary" disabled={loading}>{loading ? "Creando…" : "Crear foro"}</button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
