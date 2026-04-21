import "./InputField.css";

export default function InputField({
  label,
  id,
  error,
  type = "text",
  ...props
}) {
  return (
    <div className="input-field">
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      {type === "select" ? (
        <select id={id} className={`input-control ${error ? "input-error" : ""}`} {...props}>
          {props.children}
        </select>
      ) : type === "textarea" ? (
        <textarea id={id} className={`input-control ${error ? "input-error" : ""}`} rows={4} {...props} />
      ) : (
        <input id={id} type={type} className={`input-control ${error ? "input-error" : ""}`} {...props} />
      )}
      {error && <span className="input-hint error">{error}</span>}
    </div>
  );
}
