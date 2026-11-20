export const FORUM_TITLE_MAX = 100;
export const FORUM_DESCRIPTION_MAX = 500;
export const BODY_MAX = 299999;

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return "Ingresá tu correo electrónico.";
  if (email.length > 254 || !/^[^\s@]{1,64}@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email))
    return "Ingresá un correo válido.";
  return "";
}

export function validateBirthDate(value) {
  if (!value) return "Ingresá tu fecha de nacimiento.";
  const birth = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(birth.valueOf()) || birth.toISOString().slice(0, 10) !== value)
    return "Ingresá una fecha válida.";
  const today = new Date().toISOString().slice(0, 10);
  if (value > today) return "La fecha de nacimiento no puede ser futura.";
  const year = birth.getUTCFullYear() + 16;
  const month = birth.getUTCMonth();
  const day = birth.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  birth.setUTCFullYear(year, month, Math.min(day, lastDay));
  return birth.toISOString().slice(0, 10) > today ? "Tenés que tener al menos 16 años." : "";
}

export function validateForum({ name, desc }) {
  return {
    name: !name.trim() ? "Ingresá un título." :
      name.trim().length > FORUM_TITLE_MAX ? "El título admite hasta 100 caracteres." : "",
    desc: !desc.trim() ? "Ingresá una descripción." :
      desc.trim().length > FORUM_DESCRIPTION_MAX ? "La descripción admite hasta 500 caracteres." : "",
  };
}

export function validateBody(value, emptyMessage, minLength = 1) {
  const content = value.trim();
  if (!content) return emptyMessage;
  if (content.length < minLength) return `Escribí al menos ${minLength} caracteres para publicar.`;
  if (content.length > BODY_MAX) return "El contenido admite hasta 299.999 caracteres.";
  if ([...content].some((character) =>
    /\p{Cc}/u.test(character) && !["\n", "\r", "\t"].includes(character)
  )) return "El contenido incluye caracteres no válidos.";
  return "";
}

export function submissionError(error, fallback) {
  if (error.status === 0) return "No pudimos conectar con el servidor. Volvé a intentar.";
  return fallback;
}
