import { useCallback, useEffect, useState } from "react";
import { useFieldValidation } from "../../hooks/useFieldValidation.js";
import { submissionError, validateBody } from "../UtilityServices/formValidation.js";
import { showSuccessToast } from "../UtilityServices/successToast.jsx";
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
} from "../WebServices/commentServices";

export const useComments = (postId, token) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newCommentText, setNewCommentText] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState("");

  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deletingComment, setDeletingComment] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const createValidation = useFieldValidation({
    body: validateBody(newCommentText, "Escribí un comentario antes de enviarlo."),
  }, "comment-new");
  const editValidation = useFieldValidation({
    body: validateBody(editText, "Escribí un comentario antes de guardar."),
  }, `comment-edit-${editingId}`);
  const replyValidation = useFieldValidation({
    body: validateBody(replyText, "Escribí una respuesta antes de enviarla."),
  }, `reply-${replyingId}`);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchComments(postId);
      setComments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitComment = async (event) => {
    event.preventDefault();
    setCreateError("");
    if (!createValidation.submit(event.currentTarget)) return;
    try {
      setCreating(true);
      setCreateError("");
      await createComment(postId, { text: newCommentText.trim() }, token);
      showSuccessToast("Comentario publicado correctamente.");
      createValidation.reset();
      setNewCommentText("");
      await refresh();
    } catch (err) {
      setCreateError(submissionError(err, "No pudimos publicar el comentario. Volvé a intentar."));
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (comment) => {
    editValidation.reset();
    setEditingId(comment.id);
    setEditText(comment.text);
    setEditError("");
    setReplyingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditError("");
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setEditError("");
    if (!editValidation.submit(event.currentTarget)) return;
    try {
      setSavingEdit(true);
      setEditError("");
      await updateComment(editingId, editText.trim(), token);
      showSuccessToast("Comentario guardado correctamente.");
      setEditingId(null);
      await refresh();
    } catch (err) {
      setEditError(submissionError(err, "No pudimos guardar el comentario. Volvé a intentar."));
    } finally {
      setSavingEdit(false);
    }
  };

  const startReply = (comment) => {
    replyValidation.reset();
    setReplyingId(comment.id);
    setReplyText("");
    setReplyError("");
    setEditingId(null);
  };

  const cancelReply = () => {
    setReplyingId(null);
    setReplyText("");
    setReplyError("");
  };

  const submitReply = async (event, parentCommentId) => {
    event.preventDefault();
    setReplyError("");
    if (!replyValidation.submit(event.currentTarget)) return;
    try {
      setReplying(true);
      setReplyError("");
      await createComment(postId, { text: replyText.trim(), parentCommentId }, token);
      showSuccessToast("Respuesta publicada correctamente.");
      setReplyText("");
      setReplyingId(null);
      await refresh();
    } catch (err) {
      setReplyError(submissionError(err, "No pudimos publicar la respuesta. Volvé a intentar."));
    } finally {
      setReplying(false);
    }
  };

  const openDeleteModal = (comment) => {
    setCommentToDelete(comment);
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    if (deletingComment) return;
    setCommentToDelete(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    try {
      setDeletingComment(true);
      setDeleteError("");
      await deleteComment(commentToDelete.id, token);
      showSuccessToast("Comentario eliminado correctamente.");
      setCommentToDelete(null);
      setReplyingId(null);
      setEditingId(null);
      await refresh();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingComment(false);
    }
  };

  return {
    comments,
    loading,
    error,
    refresh,
    newCommentText,
    setNewCommentText(value) { setNewCommentText(value); setCreateError(""); },
    createValidation,
    creating,
    createError,
    submitComment,
    editingId,
    editText,
    setEditText(value) { setEditText(value); setEditError(""); },
    editValidation,
    savingEdit,
    editError,
    startEdit,
    cancelEdit,
    saveEdit,
    replyingId,
    replyText,
    setReplyText(value) { setReplyText(value); setReplyError(""); },
    replyValidation,
    replying,
    replyError,
    startReply,
    cancelReply,
    submitReply,
    commentToDelete,
    deletingComment,
    deleteError,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
};