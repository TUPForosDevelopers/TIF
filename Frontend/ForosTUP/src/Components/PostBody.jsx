import ValidationMessage from "./ValidationMessage.jsx";
import ReactionActions from "./ReactionActions.jsx";
import { Alert, Button, Dropdown, Form, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { formatBodyText } from "../Services/imgUtils/imgUtils.js";
import {
  formatDate,
  getInitial,
  getPostPreview,
  getRoleLabel,
  getRoleClass,
} from "../Services/UtilityServices/postUtils";

const PostBody = ({
  postState,
  token,
  permissions,
  requireAuth,
  navigate,
  onMakeAdminClick,
  onDeleted,
}) => {
  const {
    post,
    editing,
    editBody,
    editError,
    editValidation,
    savingEdit,
    setEditBody,
    setEditError,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteModalOpen,
    deleteError,
    deleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  } = postState;

  const {
    isBannedUser,
    canBanUser,
    canMakeAdmin,
    canEditPost,
    canDeletePost,
  } = permissions;

  const authorName = post.Person?.name || "Usuario";
  const authorRole = post.Person?.role;
  const forumName = post.Forum?.name || "Foro";
  const forumId = post.Forum?.id || post.forumId;
  const { heading } = getPostPreview(post);
  const canEdit = canEditPost(post) && post.Forum?.status !== false && !post.hidden && !editing;
  const canDelete = canDeletePost(post);
  const canBan = canBanUser(post.Person);
  const canPromote = canMakeAdmin(post.Person);

  const goToBanForm = (target) =>
    navigate(
      `/newban?userId=${target.id}&userName=${encodeURIComponent(target.name || "Usuario")}`
    );

  const handleSaveEdit = (event) => {
    event.preventDefault();
    requireAuth(() => saveEdit(event));
  };

  const handleOpenDeleteModal = () =>
    requireAuth(() => {
      if (!canDeletePost(post)) return;
      openDeleteModal();
    });

  const handleConfirmDelete = async () => {
    const ok = await confirmDelete();
    if (ok) onDeleted();
  };

  return (
    <>
      <nav className="salvia-breadcrumb" aria-label="Ubicación">
        <Link to="/foros">Foros</Link>
        <span aria-hidden="true">/</span>
        {forumId ? <Link to={`/forum/${forumId}`}>{forumName}</Link> : <span>{forumName}</span>}
        <span aria-hidden="true">/</span>
        <span aria-current="page">Publicación</span>
      </nav>

      <article className="salvia-panel post-main-block">
        <div className="post-main-meta">
          <div className="post-main-avatar">{getInitial(authorName)}</div>
          <div className="post-main-author-row">
            <span className="post-main-author">{authorName}</span>
            {authorRole && authorRole !== "USER" && (
              <span className={`user-role-badge ${getRoleClass(authorRole)}`}>{getRoleLabel(authorRole)}</span>
            )}
            {isBannedUser(post.Person) && <span className="user-role-badge">Baneado</span>}
            <span className="post-main-dot">•</span>
            <span className="post-main-date">
              {formatDate(post.postDate || post.createdAt)}
            </span>
          </div>
          {(canEdit || canDelete || canBan || canPromote) && (
            <Dropdown align="end" className="post-action-menu">
              <Dropdown.Toggle variant="outline-secondary" size="sm" aria-label="Acciones de la publicación">⋯</Dropdown.Toggle>
              <Dropdown.Menu>
                {canEdit && <Dropdown.Item onClick={() => requireAuth(startEdit)}>Editar publicación</Dropdown.Item>}
                {canDelete && <Dropdown.Item onClick={handleOpenDeleteModal}>Eliminar publicación</Dropdown.Item>}
                {canBan && <Dropdown.Item onClick={() => goToBanForm(post.Person)}>Banear</Dropdown.Item>}
                {canPromote && <Dropdown.Item onClick={() => onMakeAdminClick(post.Person)}>Hacer admin</Dropdown.Item>}
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

        {editing ? (
          <Form onSubmit={handleSaveEdit} noValidate>
            <ValidationMessage notice>{editError}</ValidationMessage>
            <Form.Group className="mb-3">
              <Form.Control
                {...editValidation.field("body")}
                as="textarea"
                rows={4}
                aria-label="Editar contenido de la publicación"
                value={editBody}
                onChange={(e) => {
                  setEditBody(e.target.value);
                  setEditError("");
                }}
              />
            </Form.Group>
            <ValidationMessage id="post-edit-body-error">{editValidation.show("body")}</ValidationMessage>
            <div className="thread-reply-actions">
              <Button type="submit" className="salvia-primary" disabled={savingEdit}>
                {savingEdit ? "Guardando..." : "Guardar"}
              </Button>
              <button type="button" className="thread-reply-cancel" onClick={cancelEdit}>
                Cancelar
              </button>
            </div>
          </Form>
        ) : (
          <>
            <h1 className="post-main-title">{heading}</h1>
            <p
              className="post-main-description"
              dangerouslySetInnerHTML={{ __html: formatBodyText(post.body) }}
            />
          </>
        )}

        <div className="post-main-actions">
          {!post.hidden && post.Forum?.status !== false && (
            <ReactionActions resource="Post" id={post.id} token={token} requireAuth={requireAuth} />
          )}
        </div>
      </article>

      <Modal dialogClassName="salvia-dialog" show={deleteModalOpen} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton={!deleting}>
          <Modal.Title>Borrar post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">¿Estás seguro que deseás borrar este post?</p>
          {deleteError && (
            <Alert variant="danger" className="mt-3 mb-0">{deleteError}</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal} disabled={deleting}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? "Borrando..." : "Borrar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PostBody;
