import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { createPost } from "../Services/postService.js";
import { BODY_MAX, submissionError, validateBody } from "../Services/UtilityServices/formValidation.js";
import { showSuccessToast } from "../Services/UtilityServices/successToast.jsx";
import { useFieldValidation } from "../hooks/useFieldValidation.js";
import ValidationMessage from "./ValidationMessage.jsx";

export default function NewPost() {
  const { forumId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const validation = useFieldValidation({
    body: validateBody(body, "Escribí el contenido de la publicación.", 10),
  }, "new-post");
  const count = body.trim().length;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!validation.submit(event.currentTarget)) return;
    if (!token) {
      setError("Iniciá sesión para publicar.");
      return;
    }
    setLoading(true);
    try {
      const post = await createPost({ body, forumId }, token);
      showSuccessToast("Publicación creada correctamente.");
      navigate(`/post/${post.id}`);
    } catch (error) {
      setError(submissionError(error, "No pudimos publicar. Volvé a intentar."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="salvia-container salvia-compose">
      <nav className="salvia-breadcrumb" aria-label="Ubicación">
        <Link to="/foros">Foros</Link><span aria-hidden="true">/</span>
        <Link to={`/forum/${forumId}`}>Foro</Link><span aria-hidden="true">/</span>
        <span aria-current="page">Nueva publicación</span>
      </nav>
      <section className="salvia-panel">
        <h1 className="salvia-title">Nueva publicación</h1>
        <ValidationMessage notice>{error}</ValidationMessage>
        <form className="salvia-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="new-post-body">Contenido <span aria-hidden="true">*</span></label>
          <textarea {...validation.field("body")} className="form-control" rows={7} name="body"
            placeholder="Escribí el contenido de tu publicación…" value={body} required
            onChange={(event) => { setBody(event.target.value); setError(""); }} />
          <div className="validation-details">
            <ValidationMessage id="new-post-body-error">{validation.show("body")}</ValidationMessage>
            <span className="validation-counter" data-over={Boolean(validation.show("body")) && count > BODY_MAX}>{count} {count === 1 ? "carácter" : "caracteres"}</span>
          </div>
          <div className="salvia-editor-actions">
            <Link className="btn salvia-secondary" to={`/forum/${forumId}`}>Cancelar</Link>
            <button className="btn salvia-primary" disabled={loading}>{loading ? "Publicando…" : "Publicar"}</button>
          </div>
        </form>
      </section>
    </main>
  );
}
