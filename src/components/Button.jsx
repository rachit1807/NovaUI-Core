export function Button({ children, variant = 'primary', size = 'md', loading = false, disabled = false, icon, type = 'button', className = '', ...props }) {
  return <button {...props} type={type} className={`button button--${variant} button--${size} ${className}`} disabled={disabled || loading} aria-busy={loading}>
    {loading ? <span className="spinner" aria-hidden="true" /> : icon && <span className="button-icon" aria-hidden="true">{icon}</span>}
    {children}
  </button>;
}
