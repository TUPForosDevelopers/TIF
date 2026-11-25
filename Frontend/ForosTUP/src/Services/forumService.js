import { forumFromApi, forumToApi } from "../adapters/forumAdapter.js";
import { httpRequest } from "./httpClient.js";

export const getForums = async () => {
  const forums = await httpRequest("/Forum");
  return forums.map(forumFromApi);
};

export const getForum = async (id) =>
  forumFromApi(await httpRequest(`/Forum/${id}`));

export const createForum = async (forum, token) =>
  forumFromApi(
    await httpRequest("/Forum", {
      method: "POST",
      body: forumToApi(forum),
      token,
    })
  );

export const updateForum = async (id, forum, token) =>
  forumFromApi(
    await httpRequest(`/Forum/${id}`, {
      method: "PUT",
      body: forumToApi(forum),
      token,
    })
  );

export const deleteForum = (id, token) =>
  httpRequest(`/Forum/${id}`, { method: "DELETE", token });
