import {
  newUserToApi,
  userChangesToApi,
  userFromApi,
} from "../adapters/userAdapter.js";
import { LOGIN_PATH } from "../config/api.js";
import { httpRequest } from "./httpClient.js";

export const getUsers = async () => {
  const users = await httpRequest("/User");
  return users.map(userFromApi);
};

export const getUser = async (id) =>
  userFromApi(await httpRequest(`/User/${id}`));

export const getUsersById = async (ids) => {
  const distinctIds = [...new Set(ids)];
  const users = await Promise.allSettled(distinctIds.map(getUser));
  return new Map(users.flatMap((result) =>
    result.status === "fulfilled" ? [[result.value.id, result.value]] : []
  ));
};

export const createUser = (user) =>
  httpRequest("/User", {
    method: "POST",
    body: newUserToApi(user),
  });

export const authenticate = (email, password) =>
  httpRequest(LOGIN_PATH, {
    method: "POST",
    body: { email: email.trim(), plainPassword: password },
  });

export const getCurrentUser = async (token, signal) =>
  userFromApi(await httpRequest("/User/me", { token, signal }));

export const updateUser = (changes, token) =>
  httpRequest("/User", { method: "PATCH", body: userChangesToApi(changes), token });

export const deleteUser = (token) =>
  httpRequest("/User/me", { method: "DELETE", token });

export const makeUserAdmin = (id, token) =>
  httpRequest(`/User/${id}/role`, { method: "PATCH", body: { role: 2 }, token });
