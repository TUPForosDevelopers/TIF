import { useRef, useState } from "react";

export function useFieldValidation(errors, prefix) {
  const edited = useRef(new Set());
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const show = (name) => submitted || touched[name] ? errors[name] || "" : "";
  const reset = () => {
    edited.current.clear();
    setTouched({});
    setSubmitted(false);
  };

  return {
    show,
    reset,
    field(name) {
      const id = `${prefix}-${name}`;
      const error = show(name);
      return {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? `${id}-error` : undefined,
        onInput: () => edited.current.add(name),
        onBlur: () => {
          if (edited.current.has(name) && !touched[name])
            setTouched((previous) => ({ ...previous, [name]: true }));
        },
      };
    },
    submit(form) {
      setSubmitted(true);
      const invalid = Object.keys(errors).find((name) => errors[name]);
      if (invalid) form.ownerDocument.getElementById(`${prefix}-${invalid}`)?.focus();
      return !invalid;
    },
  };
}
