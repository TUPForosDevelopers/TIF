import { useState } from "react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { httpRequest } from "../Services/httpClient.js";

export default function ReactionActions({ resource, id, token, requireAuth }) {
  const [saving, setSaving] = useState(false);

  const saveReaction = (isLike) => requireAuth(async () => {
    setSaving(true);
    try {
      await httpRequest(`/${resource}/${id}/reaction`, {
        method: isLike === undefined ? "DELETE" : "PUT",
        body: isLike,
        token,
      });
      toast.success(isLike === undefined ? "Reacción quitada." : "Reacción guardada.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  });

  return (
    <div role="group" aria-label="Reacciones" className="d-flex flex-wrap gap-1">
      <Button size="sm" variant="outline-secondary" disabled={saving} onClick={() => saveReaction(true)}>
        Me gusta
      </Button>
      <Button size="sm" variant="outline-secondary" disabled={saving} onClick={() => saveReaction(false)}>
        No me gusta
      </Button>
      <Button size="sm" variant="outline-secondary" disabled={saving} onClick={() => saveReaction()}>
        Quitar reacción
      </Button>
    </div>
  );
}
