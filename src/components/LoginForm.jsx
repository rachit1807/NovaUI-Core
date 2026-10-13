import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from './Button';
import { FormInput } from './FormInput';
import { validateLogin } from '../lib/validation';
export function LoginForm({ onSubmit, onReset }) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [complete, setComplete] = useState(false);
  function update(field, value) {
    setValues(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
  }
  function submit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit?.({ email: values.email.trim(), remember });
    setComplete(true);
    setValues({ email: '', password: '' });
  }
  function reset() {
    setValues({ email: '', password: '' }); setErrors({}); setComplete(false); setRemember(false); setShowPassword(false); onReset?.();
  }
  if (complete) return <div className="form-success" role="status"><span className="success-mark"><Check size={24}/></span><h3>You're all set.</h3><p>The form passed validation and fired its submit event.</p><Button variant="secondary" onClick={reset}>Try again</Button><small>This is a local component demo. No account was created.</small></div>;
  return <form onSubmit={submit} noValidate className="login-form">
    <div className="form-heading"><span className="mini-logo">N</span><h3>Welcome back</h3><p>A little validation goes a long way.</p></div>
    <FormInput label="Email address" type="email" placeholder="you@example.com" autoComplete="off" value={values.email} onChange={event => update('email', event.target.value)} error={errors.email} required />
    <div className="password-field"><FormInput label="Password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" autoComplete="off" value={values.password} onChange={event => update('password', event.target.value)} error={errors.password} required/><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
    <label className="checkbox-label"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)}/>Remember this demo preference</label>
    <Button type="submit" className="full-width" icon={<ArrowRight size={16}/>}>Continue</Button>
    <p className="demo-note">Try any email and a password with 8+ characters.<br/>Demo only — use sample details.</p>
  </form>;
}
