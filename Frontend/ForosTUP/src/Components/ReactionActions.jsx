import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { httpRequest } from "../Services/httpClient.js";
import ValidationMessage from "./ValidationMessage.jsx";

export default function ReactionActions({ resource, id, token, requireAuth }) {
  const path = `/${resource}/${id}/reaction`;
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const request = new AbortController();
    httpRequest(path, { token, signal: request.signal })
      .then((result) => {
        if (!request.signal.aborted) setSummary(result);
      })
      .catch(() => {
        if (!request.signal.aborted) setError("No pudimos cargar las reacciones.");
      })
      .finally(() => {
        if (!request.signal.aborted) setLoading(false);
      });
    return () => request.abort();
  }, [path, token, retry]);

  const saveReaction = (isLike) => requireAuth(async () => {
    if (saving || loading || !summary) return;
    setSaving(true);
    setError("");
    const remove = summary?.myReaction === isLike;
    try {
      await httpRequest(path, {
        method: remove ? "DELETE" : "PUT",
        body: remove ? undefined : isLike,
        token,
      });
      try {
        setSummary(await httpRequest(path, { token }));
      } catch {
        // La escritura ya quedó confirmada aunque falle la lectura de totales.
        setSummary((previous) => ({
          likes: previous?.likes != null ? previous.likes - Number(previous.myReaction === true) + Number(!remove && isLike) : null,
          dislikes: previous?.likes != null ? previous.dislikes - Number(previous.myReaction === false) + Number(!remove && !isLike) : null,
          myReaction: remove ? null : isLike,
        }));
      }
    } catch {
      setError("No pudimos guardar tu reacción. Volvé a intentar.");
    } finally {
      setSaving(false);
    }
  });

  return (
    <div role="group" aria-label="Reacciones" className="reaction-actions d-flex flex-wrap gap-1">
      {[[true, "Me gusta", summary?.likes], [false, "No me gusta", summary?.dislikes]].map(([isLike, text, count]) => (
        <Button key={text} type="button" size="sm" variant="outline-secondary" className="reaction-button"
          disabled={saving || loading || !summary} aria-pressed={summary?.myReaction === isLike}
          onClick={() => saveReaction(isLike)}>
          {text}{count != null && <span className="reaction-count">{count}</span>}
        </Button>
      ))}
      {!loading && !summary && (
        <Button variant="outline-secondary" size="sm" onClick={() => {
          setLoading(true);
          setError("");
          setRetry((previous) => previous + 1);
        }}>Reintentar</Button>
      )}
      <ValidationMessage>{error}</ValidationMessage>
    </div>
  );
}
