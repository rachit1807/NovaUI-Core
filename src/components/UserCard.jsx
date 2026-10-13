import { Mail, Star, Check } from 'lucide-react';
import { Button } from './Button';
export function UserCard({ user, compact = false, selected = false, onSelect, onContact }) {
  const { name, role, email, status = 'Available', initials, color = 'blue' } = user;
  return <article className={`user-card ${compact ? 'user-card--compact' : ''}`} aria-label={`${name} profile`}>
    <div className="user-card-top"><span className={`avatar avatar--${color}`}>{initials || name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span><button className={`favorite ${selected ? 'is-favorite' : ''}`} aria-label={`${selected ? 'Unsave' : 'Save'} ${name}`} aria-pressed={selected} onClick={() => onSelect?.(user)}><Star size={18} fill={selected ? 'currentColor' : 'none'}/></button></div>
    <h3>{name}</h3><p className="user-role">{role}</p><span className={`user-status ${status === 'Away' ? 'is-away' : ''}`}><i/>{status}</span>
    {!compact && <><div className="user-details"><span><Mail size={14}/>{email}</span><span><Check size={14}/>Core team member</span></div><Button variant="secondary" className="full-width" onClick={() => onContact?.(user)} icon={<Mail size={15}/>}>Contact {name.split(' ')[0]}</Button></>}
  </article>;
}
