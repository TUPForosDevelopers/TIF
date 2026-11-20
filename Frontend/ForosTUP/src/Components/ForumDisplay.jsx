import { showSuccessToast } from "../Services/UtilityServices/successToast.jsx";
import { Alert, Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { deleteForum } from "../Services/forumService.js";

export default function ForumDisplay({ forum, onDelete }) {
  const { isSysAdmin, token } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await deleteForum(forum.id, token);
      showSuccessToast("Foro eliminado correctamente.");
      setConfirming(false);
      onDelete();
    } catch (error) {
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <li className="salvia-panel salvia-forum-card">
      <Link to={`/forum/${forum.id}`} className="salvia-card-link">
        <div className="salvia-card-heading">
          <span className="salvia-forum-icon" aria-hidden="true"><span className="salvia-mark" /></span>
          <h3>{forum.name}</h3>
        </div>
        {forum.desc && <p>{forum.desc}</p>}
        <span className="salvia-card-arrow" aria-hidden="true">→</span>
      </Link>
      {isSysAdmin && (
        <button type="button" className="salvia-delete-forum" onClick={() => { setError(""); setConfirming(true); }}>
          Eliminar foro
        </button>
      )}
      <Modal dialogClassName="salvia-dialog" show={confirming} onHide={() => !deleting && setConfirming(false)} centered>
        <Modal.Header closeButton={!deleting}><Modal.Title>Eliminar foro</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>¿Querés eliminar el foro «{forum.name}»?</p>
          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" disabled={deleting} onClick={() => setConfirming(false)}>Cancelar</Button>
          <Button variant="danger" disabled={deleting} onClick={handleDelete}>
            {deleting ? "Eliminando…" : "Eliminar foro"}
          </Button>
        </Modal.Footer>
      </Modal>
    </li>
  );
}
