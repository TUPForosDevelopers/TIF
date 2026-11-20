import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useFieldValidation } from "../../hooks/useFieldValidation.js";
import { submissionError, validateBody } from "../UtilityServices/formValidation.js";
import { TOAST_SUCCESS } from "../UtilityServices/postUtils";
import {
  fetchPost,
  updatePost,
  deletePost,
} from "../WebServices/postServices";

export const usePost = (postId, token) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const editValidation = useFieldValidation({
    body: validateBody(editBody, "Escribí el contenido de la publicación."),
  }, "post-edit");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchPost(postId);
      setPost(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startEdit = () => {
    editValidation.reset();
    setEditing(true);
    setEditBody(post?.body || "");
    setEditError("");
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditBody("");
    setEditError("");
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setEditError("");
    if (!editValidation.submit(event.currentTarget)) return;
    try {
      setSavingEdit(true);
      setEditError("");
      await updatePost(postId, { body: editBody.trim() }, token);
      toast.success("Post actualizado correctamente", TOAST_SUCCESS);
      setEditing(false);
      await refresh();
    } catch (err) {
      setEditError(submissionError(err, "No pudimos guardar la publicación. Volvé a intentar."));
    } finally {
      setSavingEdit(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModalOpen(false);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      setDeleteError("");
      await deletePost(postId, token);
      toast.success("El post ha sido eliminado correctamente", TOAST_SUCCESS);
      setDeleteModalOpen(false);
      return true;
    } catch (err) {
      setDeleteError(err.message);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    post,
    loading,
    error,
    refresh,
    editing,
    editBody,
    editError,
    savingEdit,
    setEditBody,
    setEditError,
    editValidation,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteModalOpen,
    deleteError,
    deleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
};
