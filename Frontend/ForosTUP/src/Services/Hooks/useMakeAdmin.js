import { showSuccessToast } from "../UtilityServices/successToast.jsx";
import { useState } from "react";
import { toast } from "react-toastify";
import { makeUserAdmin } from "../userService.js";

export const useMakeAdmin = (token, onSuccess) => {
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const request = (user) => {
    setTargetUser(user);
    setError("");
  };

  const close = () => {
    if (loading) return;
    setTargetUser(null);
    setError("");
  };

  const confirm = async () => {
    if (!targetUser) return;
    try {
      setLoading(true);
      setError("");
      await makeUserAdmin(targetUser.id, token);
      showSuccessToast("Usuario convertido en administrador.");
      setTargetUser(null);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "No se pudo convertir el usuario en ADMIN");
    } finally {
      setLoading(false);
    }
  };

  return { targetUser, loading, error, request, close, confirm };
};