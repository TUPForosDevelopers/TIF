import { getUsersById } from "./userService.js";
import { newPostToApi, postFromApi } from "../adapters/postAdapter.js";
import { httpRequest } from "./httpClient.js";

export const getPostsByForum = async (forumId) => {
  const posts = await httpRequest(`/Post?forumId=${encodeURIComponent(forumId)}`);
  const authors = await getUsersById(posts.map(({ poster }) => poster));
  return posts.map((post) => ({ ...postFromApi(post), Person: authors.get(post.poster) }));
};

export const getPost = async (id) =>
  postFromApi(await httpRequest(`/Post/${id}`));

export const createPost = async (post, token) =>
  postFromApi(
    await httpRequest("/Post", {
      method: "POST",
      body: newPostToApi(post),
      token,
    })
  );

export const updatePostBody = (id, body, token) =>
  httpRequest(`/Post/${id}`, {
    method: "PATCH",
    body: body.trim(),
    token,
  });

export const deletePost = (id, token) =>
  httpRequest(`/Post/${id}`, { method: "DELETE", token });
