import { toast } from "react-toastify";

export function showSuccessToast(message) {
  toast.success(<span>{message} <span className="success-toast-mark" aria-hidden="true">✓</span></span>, {
    role: "status",
  });
}
