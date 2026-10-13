import { useId } from "react";
export function FormInput({
  id,
  label,
  error,
  hint,
  required = false,
  className = "",
  ...props
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const description = error || hint;
  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={fieldId}>
        {label}
        {required && (
          <span className="required" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      <input
        {...props}
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={description ? `${fieldId}-description` : undefined}
      />
      {description && (
        <p
          id={`${fieldId}-description`}
          className={error ? "field-error" : "field-hint"}
          role={error ? "alert" : undefined}
        >
          {description}
        </p>
      )}
    </div>
  );
}
