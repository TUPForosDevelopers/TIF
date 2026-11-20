import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Spinner } from "react-bootstrap";
import { getForum, updateForum } from "../Services/forumService.js";
import { getPostsByForum } from "../Services/postService.js";
import { useRequireAuth } from "../Services/Hooks/useRequireAuth.js";
import { formatDate, getInitial, getPostPreview, normalizeSearch } from "../Services/UtilityServices/postUtils.js";
import { useApiResource } from "../hooks/useApiResource.js";
import { useAuth } from "../context/AuthContext.jsx";
import Redirecting from "./Redirecting.jsx";

function ForumDetail({ forumId }) {
  const navigate = useNavigate();
  const { isAdmin, token } = useAuth();
  const { requireAuth, redirecting } = useRequireAuth();
  const forumResource = useApiResource(getForum, forumId, null);
  const postResource = useApiResource(getPostsByForum, forumId, []);
  const { data: forum } = forumResource;
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("recent");

  const saveForum = async (event) => {
    event.preventDefault();
    setSaving(true);
    setEditError("");
    try {
      await updateForum(forumId, draft, token);
      setDraft(null);
      await forumResource.refetch();
    } catch (error) {
      setEditError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (redirecting) return <Redirecting />;
  if (forumResource.loading || forumResource.error || !forum) {
    return (
      <main className="salvia-container salvia-forum-page">
        <Link to="/foros">Volver a Foros</Link>
        {forumResource.loading ? (
          <p className="salvia-empty" role="status"><Spinner size="sm" /> Cargando foro…</p>
        ) : (
          <Alert variant="danger">{forumResource.error || "No se encontró el foro."}</Alert>
        )}
      </main>
    );
  }

  const search = normalizeSearch(query);
  const posts = postResource.data
    .map((post) => ({ post, ...getPostPreview(post) }))
    .filter(({ post, heading, excerpt }) => normalizeSearch(
      `${heading} ${excerpt} ${post.Person?.name || ""}`
    ).includes(search))
    .sort((a, b) => {
      const difference = (Date.parse(b.post.postDate) || 0) - (Date.parse(a.post.postDate) || 0);
      return order === "recent" ? difference : -difference;
    });

  return (
    <main className="salvia-container salvia-forum-page">
      <nav className="salvia-breadcrumb" aria-label="Ubicación">
        <Link to="/foros">Foros</Link><span aria-hidden="true">/</span><span aria-current="page">{forum.name}</span>
      </nav>
      <div className="salvia-forum-header">
        <div>
          <h1 className="salvia-title">{forum.name}</h1>
          {!forum.status && <p className="salvia-lede">Foro inactivo</p>}
        </div>
        <div className="salvia-toolbar salvia-forum-controls">
          {isAdmin && !draft && (
            <button className="btn salvia-secondary" onClick={() => {
              setEditError("");
              setDraft({ name: forum.name, desc: forum.desc || "" });
            }}>Editar foro</button>
          )}
          <button className="btn salvia-primary" disabled={!forum.status}
            onClick={() => requireAuth(() => navigate(`/forums/${forumId}/posts/new`))}>
            Nueva publicación
          </button>
        </div>
      </div>
      {draft && (
        <form className="salvia-panel salvia-forum-editor" onSubmit={saveForum}>
          <label>Nombre del foro
            <input className="form-control" value={draft.name} required
              onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label>Descripción
            <textarea className="form-control" value={draft.desc} rows={3} required
              onChange={(event) => setDraft({ ...draft, desc: event.target.value })} />
          </label>
          {editError && <Alert variant="danger">{editError}</Alert>}
          <div className="salvia-editor-actions">
            <button type="button" className="btn salvia-secondary" disabled={saving} onClick={() => setDraft(null)}>Cancelar</button>
            <button className="btn salvia-primary" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
          </div>
        </form>
      )}
      <div className="salvia-forum-columns">
        <section className="salvia-panel salvia-publications" aria-labelledby="publications-title">
          <h2 id="publications-title">Publicaciones</h2>
          <div className="salvia-toolbar salvia-publications-toolbar">
            <label className="salvia-search">
              <span className="salvia-search-icon" aria-hidden="true" />
              <input className="form-control" type="search" aria-label="Buscar publicaciones"
                placeholder="Buscar publicaciones…" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <select className="form-select" aria-label="Orden de publicaciones" value={order}
              onChange={(event) => setOrder(event.target.value)}>
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguas</option>
            </select>
          </div>
          {postResource.loading ? (
            <p className="salvia-empty" role="status"><Spinner size="sm" /> Cargando publicaciones…</p>
          ) : postResource.error ? (
            <Alert variant="danger">
              {postResource.error} <button className="btn salvia-secondary" onClick={postResource.refetch}>Reintentar</button>
            </Alert>
          ) : posts.length === 0 ? (
            <div className="salvia-empty">
              <p>{search ? "No hay publicaciones que coincidan con tu búsqueda." : "Todavía no hay publicaciones."}</p>
              {search && <button className="btn salvia-secondary" onClick={() => setQuery("")}>Limpiar búsqueda</button>}
            </div>
          ) : (
            <ul className="salvia-publication-list">
              {posts.map(({ post, heading, excerpt }) => {
                const author = post.Person?.name || "Usuario";
                return (
                  <li key={post.id}>
                    <Link to={`/post/${post.id}`}>
                      <h3>{heading}</h3>
                      {excerpt && <p>{excerpt}</p>}
                      <div className="salvia-byline">
                        <span className="salvia-avatar" aria-hidden="true">{getInitial(author)}</span>
                        {author}<span aria-hidden="true">·</span>{formatDate(post.postDate)}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <aside className="salvia-forum-sidebar" aria-label="Información del foro">
          {forum.desc && <section className="salvia-panel"><h2>Acerca del foro</h2><p>{forum.desc}</p></section>}
          <section className="salvia-panel">
            <h2>Reglas</h2>
            <ul>
              <li>Respetá a los demás usuarios.</li>
              <li>Evitá el spam.</li>
              <li>Evitá el contenido ofensivo.</li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default function ForumPage() {
  const { forumId } = useParams();
  return <ForumDetail key={forumId} forumId={forumId} />;
}
