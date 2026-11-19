import { getUsersById } from "../userService.js";
import { httpRequest } from "../httpClient.js";

export const fetchComments = async (postId) => {
  const comments = await httpRequest(`/Comment?postId=${encodeURIComponent(postId)}`);
  const authors = await getUsersById(comments.map(({ poster }) => poster));

  return comments.map((comment) => ({
    id: comment.id,
    userId: comment.poster,
    postDate: comment.date,
    parentCommentId: comment.repliedComment,
    text: comment.isDeleted ? "Comentario eliminado." : comment.body,
    isDeleted: comment.isDeleted,
    hidden: comment.invisible,
    Person: authors.get(comment.poster),
  }));
};

export const createComment = (postId, { text, parentCommentId }, token) =>
  httpRequest("/Comment", {
    method: "POST",
    body: { parentPost: postId, body: text, repliedComment: parentCommentId ?? null },
    token,
  });

export const updateComment = (id, text, token) =>
  httpRequest(`/Comment/${id}`, { method: "PATCH", body: text, token });

export const deleteComment = (id, token) =>
  httpRequest(`/Comment/${id}`, { method: "DELETE", token });
