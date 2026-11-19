import { httpRequest } from "./httpClient.js";
import { getUsers } from "./userService.js";

export const getBans = async (token) => {
  const bans = await httpRequest("/Ban", { token }).catch((error) => {
    if (error.status === 404) return [];
    throw error;
  });
  const users = bans.length ? await getUsers().catch(() => []) : [];
  const usersById = new Map(users.map((user) => [user.id, user]));
  return bans.map((ban) => ({
    ...ban,
    status: ban.status.toLowerCase(),
    bannedUser: usersById.get(ban.userId),
    adminUser: usersById.get(ban.adminId),
  }));
};

export const createBan = ({ userId, reason, duration }, token) =>
  httpRequest("/Ban", {
    method: "POST",
    body: { userId, reason: reason.trim(), days: Number(duration) },
    token,
  });

export const updateBan = (id, { reason, duration }, token) =>
  httpRequest("/Ban", {
    method: "PATCH",
    body: { id, newReason: reason.trim(), newDays: Number(duration) },
    token,
  });

export const revokeBan = (id, token) =>
  httpRequest(`/Ban/${id}/revoke`, { method: "PATCH", token });
