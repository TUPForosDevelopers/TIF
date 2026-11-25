import { useState } from "react";

export function useFieldValidation(errors, prefix) {
  const [messages, setMessages] = useState({});
  const show = (name) => messages[name] || "";

  return {
    show,
    reset: () => setMessages({}),
    report(name, message) {
      setMessages((previous) => ({ ...previous, [name]: message }));
    },
    field(name) {
      const id = `${prefix}-${name}`;
      const error = show(name);
      return {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? `${id}-error` : undefined,
        onInput: () => {
          if (error) setMessages((previous) => ({ ...previous, [name]: "" }));
        },
      };
    },
    submit(form) {
      setMessages(errors);
      const invalid = Object.keys(errors).find((name) => errors[name]);
      if (invalid) form.ownerDocument.getElementById(`${prefix}-${invalid}`)?.focus();
      return !invalid;
    },
  };
}
