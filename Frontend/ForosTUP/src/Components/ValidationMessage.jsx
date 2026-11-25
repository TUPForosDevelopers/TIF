export default function ValidationMessage({ children, id, notice = false }) {
  if (!children) return null;
  return (
    <p id={id} className={notice ? "validation-notice" : "validation-message"} role={notice ? "alert" : undefined}>
      {children} <span className="validation-mark" aria-hidden="true">!</span>
    </p>
  );
}
