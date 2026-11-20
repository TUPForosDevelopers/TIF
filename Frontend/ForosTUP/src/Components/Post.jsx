import { Alert, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useRequireAuth } from "../Services/Hooks/useRequireAuth.js";
import Redirecting from "./Redirecting";
import PostBody from "./PostBody";
import CommentSection from "./CommentSection.jsx";
import { useComments } from "../Services/Hooks/useComment.js";
import { useMakeAdmin } from "../Services/Hooks/useMakeAdmin.js";
import { usePost } from "../Services/Hooks/usePost.js";
import { createPermissions } from "../Services/UtilityServices/postPermissions.js";
import "./Post.css";

const Post = ({ postId }) => {
  const { token, user, isAdmin, isSysAdmin } = useAuth();
  const { requireAuth, redirecting } = useRequireAuth();
  const navigate = useNavigate();

  const post = usePost(postId, token);
  const comments = useComments(postId, token);
  const refresh = () => {
    post.refresh();
    comments.refresh();
  };
  const promotion = useMakeAdmin(token, refresh);
  const permissions = createPermissions({ user, isAdmin, isSysAdmin });

  const handleDeleted = () => {
    const forumId = post.post?.Forum?.id || post.post?.forumId;
    navigate(forumId ? `/forum/${forumId}` : "/foros");
  };

  if (redirecting) return <Redirecting />;

  if (post.loading) {
    return (
      <main className="post-thread-page">
        <div className="post-thread-state">
          <Spinner animation="border" />
          <p>Cargando publicación...</p>
        </div>
      </main>
    );
  }

  if (post.error) {
    return (
      <main className="post-thread-page">
        <div className="post-thread-state">
          <Alert variant="danger" className="mb-0">{post.error}</Alert>
        </div>
      </main>
    );
  }

  if (!post.post) {
    return (
      <main className="post-thread-page">
        <div className="post-thread-state">
          <Alert variant="warning" className="mb-0">Publicación no encontrada.</Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="post-thread-page">
      <section className="post-thread-container">
        <PostBody
          postState={post}
          permissions={permissions}
          requireAuth={requireAuth}
          navigate={navigate}
          onMakeAdminClick={promotion.request}
          token={token}
          onDeleted={handleDeleted}
        />
        <CommentSection
          commentsState={comments}
          permissions={permissions}
          token={token}
          user={user}
          requireAuth={requireAuth}
          navigate={navigate}
          onMakeAdminClick={promotion.request}
          readOnly={post.post.hidden || post.post.Forum?.status === false}
        />
      </section>
      <Modal dialogClassName="salvia-dialog" show={!!promotion.targetUser} onHide={promotion.close} centered>
        <Modal.Header closeButton={!promotion.loading}>
          <Modal.Title>Hacer admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Querés dar permisos de administración a {promotion.targetUser?.name}?</p>
          {promotion.error && <Alert variant="danger">{promotion.error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" disabled={promotion.loading} onClick={promotion.close}>
            Cancelar
          </Button>
          <Button disabled={promotion.loading} onClick={promotion.confirm}>
            {promotion.loading ? "Guardando..." : "Confirmar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default Post;
