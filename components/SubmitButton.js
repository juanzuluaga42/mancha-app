'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ children, className = 'auth-submit', pendingText = 'Enviando...' }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
