import ReactionActions from "./ReactionActions.jsx";
import { Button, Dropdown, Form } from "react-bootstrap";
import { formatBodyText } from "../Services/imgUtils/imgUtils.js";
import {
  formatDate,
  getInitial,
  getRoleLabel,
  getRoleClass,
} from "../Services/UtilityServices/postUtils";

const Comment = ({
  comment,
  level,
  commentsState,
  permissions,
  token,
  readOnly,
  requireAuth,
  navigate,
  onMakeAdminClick,
  onDeleteClick,
}) => {
  const {
    editingId,
    editText,
    setEditText,
    savingEdit,
    editError,
    startEdit,
    cancelEdit,
    saveEdit,
    replyingId,
    replyText,
    setReplyText,
    replying,
    replyError,
    startReply,
    cancelReply,
    submitReply,
  } = commentsState;

  const { isBannedUser, canBanUser, canMakeAdmin, canEditComment, canDeleteComments } = permissions;

  const author = comment.Person?.name || "Usuario";
  const role = comment.Person?.role;
  const children = comment.children || [];
  const isReplying = replyingId === comment.id;
  const isEditing = editingId === comment.id;
  const canReply = !readOnly && !comment.isDeleted && !comment.hidden;
  const canEdit = !readOnly && canEditComment(comment) && !isEditing;
  const canDelete = canDeleteComments(comment);
  const canBan = canBanUser(comment.Person);
  const canPromote = canMakeAdmin(comment.Person);

  const goToBanForm = (target) =>
    navigate(
      `/newban?userId=${target.id}&userName=${encodeURIComponent(target.name || "Usuario")}`
    );

  const childProps = {
    commentsState,
    permissions,
    token,
    readOnly,
    requireAuth,
    navigate,
    onMakeAdminClick,
    onDeleteClick,
  };

  return (
    <div className={`thread-comment level-${Math.min(level, 4)}`}>
      <div className="thread-comment-main">
        <div className="thread-comment-avatar">{getInitial(author)}</div>

        <div className="thread-comment-body">
          <div className="thread-comment-meta">
            <span className="thread-comment-author">{author}</span>
            {role && role !== "USER" && (
              <span className={`user-role-badge ${getRoleClass(role)}`}>{getRoleLabel(role)}</span>
            )}
            {isBannedUser(comment.Person) && <span className="user-role-badge">Baneado</span>}
            <span className="thread-comment-dot">•</span>
            <span className="thread-comment-date">
              {formatDate(comment.postDate || comment.createdAt)}
            </span>
            {(canEdit || canDelete || canBan || canPromote) && (
              <Dropdown align="end" className="post-action-menu">
                <Dropdown.Toggle variant="outline-secondary" size="sm" aria-label={`Acciones del comentario de ${author}`}>⋯</Dropdown.Toggle>
                <Dropdown.Menu>
                  {canEdit && <Dropdown.Item onClick={() => requireAuth(() => startEdit(comment))}>Editar comentario</Dropdown.Item>}
                  {canDelete && <Dropdown.Item onClick={() => onDeleteClick(comment)}>Borrar comentario</Dropdown.Item>}
                  {canBan && <Dropdown.Item onClick={() => goToBanForm(comment.Person)}>Banear</Dropdown.Item>}
                  {canPromote && <Dropdown.Item onClick={() => onMakeAdminClick(comment.Person)}>Hacer admin</Dropdown.Item>}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>

          {isEditing ? (
            <Form
              onSubmit={(event) => {
                event.preventDefault();
                requireAuth(() => saveEdit(event));
              }}
              className="thread-reply-form"
              noValidate
            >
              <Form.Control
                as="textarea"
                rows={2}
                aria-label="Editar comentario"
                className="thread-reply-input"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                isInvalid={!!editError}
              />
              {editError && <div className="thread-reply-error">{editError}</div>}
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
            <p
              className="thread-comment-text"
              dangerouslySetInnerHTML={{ __html: formatBodyText(comment.text) }}
            />
          )}

          {canReply && (
            <div className="thread-comment-actions">
              <button type="button" className="thread-text-button" onClick={() => requireAuth(() => startReply(comment))}>
                Responder
              </button>
              <ReactionActions resource="Comment" id={comment.id} token={token} requireAuth={requireAuth} />
            </div>
          )}

          {isReplying && canReply && (
            <Form
              onSubmit={(event) => {
                event.preventDefault();
                requireAuth(() => submitReply(event, comment.id));
              }}
              className="thread-reply-form"
              noValidate
            >
              <label className="thread-reply-label" htmlFor={`reply-${comment.id}`}>Respondiendo a {author}</label>
              <Form.Control
                id={`reply-${comment.id}`}
                as="textarea"
                rows={2}
                className="thread-reply-input"
                placeholder="Escribí tu respuesta…"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                isInvalid={!!replyError}
              />
              {replyError && <div className="thread-reply-error">{replyError}</div>}
              <div className="thread-reply-actions">
                <Button type="submit" className="salvia-primary" disabled={replying}>
                  {replying ? "Respondiendo..." : "Responder"}
                </Button>
                <button type="button" className="thread-reply-cancel" onClick={cancelReply}>
                  Cancelar
                </button>
              </div>
            </Form>
          )}

          {children.length > 0 && (
            <div className="thread-children">
              {children.map((child) => (
                <Comment
                  key={child.id}
                  comment={child}
                  level={level + 1}
                  {...childProps}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;