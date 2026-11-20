import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Spinner } from "react-bootstrap";
import Forums from "./Forums.jsx";
import { useApiResource } from "../hooks/useApiResource.js";
import { getForums } from "../Services/forumService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { normalizeSearch } from "../Services/UtilityServices/postUtils.js";

export default function ForumListPage({ embedded = false }) {
  const { isAdmin } = useAuth();
  const { data: forums, loading, error, refetch } = useApiResource(getForums, undefined, []);
  const [search, setSearch] = useState("");
  const query = normalizeSearch(search);
  const filteredForums = forums.filter((forum) =>
    forum.status && normalizeSearch(`${forum.name} ${forum.desc || ""}`).includes(query)
  );
  const Wrapper = embedded ? "section" : "main";
  const Heading = embedded ? "h2" : "h1";

  return (
    <Wrapper className="salvia-container salvia-directory">
      <Heading className="salvia-title">Foros de la comunidad</Heading>
      {!embedded && <p className="salvia-lede">Elegí un foro y sumate a la conversación.</p>}
      <div className="salvia-toolbar">
        <label className="salvia-search">
          <span className="salvia-search-icon" aria-hidden="true" />
          <input className="form-control" type="search" aria-label="Buscar foros"
            placeholder="Buscar foros…" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        {isAdmin && <Link className="btn salvia-primary" to="/newforum">Crear foro</Link>}
      </div>

      {loading ? (
        <p className="salvia-empty" role="status"><Spinner size="sm" /> Cargando foros…</p>
      ) : error ? (
        <Alert variant="danger">
          {error} <button className="btn salvia-secondary" onClick={refetch}>Reintentar</button>
        </Alert>
      ) : filteredForums.length ? (
        <Forums forumsProp={filteredForums} onDelete={refetch} />
      ) : (
        <div className="salvia-empty">
          <p>{query ? "No hay foros que coincidan con tu búsqueda." : "Todavía no hay foros activos."}</p>
          {query && <button className="btn salvia-secondary" onClick={() => setSearch("")}>Limpiar búsqueda</button>}
        </div>
      )}
    </Wrapper>
  );
}
