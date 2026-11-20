import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import Comment from "./Comment";
import { buildCommentTree, getInitial } from "../Services/UtilityServices/postUtils";

const CommentSection = ({
  commentsState,
  permissions,
  user,
  token,
  readOnly,
  requireAuth,
  navigate,
  onMakeAdminClick,
}) => {
  const {
    comments,
    newCommentText,
    setNewCommentText,
    creating,
    createError,
    submitComment,
    commentToDelete,
    deletingComment,
    deleteError,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  } = commentsState;

  const commentTree = buildCommentTree(comments);

  const commentProps = {
    commentsState,
    permissions,
    token,
    readOnly,
    requireAuth,
    navigate,
    onMakeAdminClick,
    onDeleteClick: (comment) => requireAuth(() => openDeleteModal(comment)),
  };

  return (
    <>
      <h2 className="post-comments-heading">Comentarios</h2>
      {!readOnly && <section className="salvia-panel post-comment-entry">
        <Form onSubmit={(event) => {
          event.preventDefault();
          requireAuth(() => submitComment(event));
        }} noValidate>
          <div className="post-comment-input-row">
            <div className="post-comment-user-avatar" aria-hidden="true">{getInitial(user?.name || "U")}</div>
            <Form.Control
              type="text"
              className="post-comment-input"
              placeholder="Escribí un comentario…"
              aria-label="Escribí un comentario"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              isInvalid={!!createError}
            />
            <Button type="submit" className="salvia-primary post-comment-submit" disabled={creating}>
              {creating ? "Comentando…" : "Comentar"}
            </Button>
          </div>
          {createError && <p role="alert" className="post-comment-error">{createError}</p>}
        </Form>
      </section>}

      <section className="post-comments-thread">
        {commentsState.loading ? (
          <Spinner animation="border" aria-label="Cargando comentarios" />
        ) : commentsState.error ? (
          <Alert variant="danger">{commentsState.error}</Alert>
        ) : commentTree.length === 0 ? (
          <div className="post-comments-empty">
            <h3>No hay comentarios todavía</h3>
            <p>Sé el primero en unirte a la conversación.</p>
          </div>
        ) : (
          commentTree.map((comment) => (
            <Comment key={comment.id} comment={comment} level={0} {...commentProps} />
          ))
        )}
      </section>

      <Modal dialogClassName="salvia-dialog" show={!!commentToDelete} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton={!deletingComment}>
          <Modal.Title>Borrar comentario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">¿Estás seguro que deseás borrar este comentario?</p>
          <p>Las respuestas existentes se conservan.</p>
          {deleteError && (
            <Alert variant="danger" className="mt-3 mb-0">{deleteError}</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal} disabled={deletingComment}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deletingComment}>
            {deletingComment ? "Borrando..." : "Borrar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CommentSection;