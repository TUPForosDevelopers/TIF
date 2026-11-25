import ValidationMessage from "./ValidationMessage.jsx";
import { FORUM_DESCRIPTION_MAX, FORUM_TITLE_MAX } from "../Services/UtilityServices/formValidation.js";

const fields = [
  { name: "name", label: "Título", max: FORUM_TITLE_MAX, Control: "input" },
  { name: "desc", label: "Descripción", max: FORUM_DESCRIPTION_MAX, Control: "textarea" },
];

export default function ForumFields({ values, onChange, validation }) {
  return fields.map(({ name, label, max, Control }) => {
    const field = validation.field(name);
    const count = values[name].trim().length;
    return (
      <div className="salvia-form-field" key={name}>
        <label htmlFor={field.id}>{label} <span aria-hidden="true">*</span></label>
        <Control {...field} className="form-control" name={name} value={values[name]} required
          rows={Control === "textarea" ? 4 : undefined}
          onChange={(event) => onChange({ ...values, [name]: event.target.value })} />
        <div className="validation-details">
          <ValidationMessage id={`${field.id}-error`}>{validation.show(name)}</ValidationMessage>
          <span className="validation-counter" data-over={Boolean(validation.show(name)) && count > max}>{count} / {max}</span>
        </div>
      </div>
    );
  });
}
