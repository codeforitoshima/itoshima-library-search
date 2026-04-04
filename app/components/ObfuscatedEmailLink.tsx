import { useEffect, useRef } from "react";

interface ObfuscatedEmailLinkProps {
  user: string;
  domain: string;
  className?: string;
}

export function ObfuscatedEmailLink({ user, domain, className }: ObfuscatedEmailLinkProps) {
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (labelRef.current) labelRef.current.textContent = `${user}@${domain}`;
  }, [user, domain]);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.location.href = `mailto:${user}@${domain}`;
      }}
    >
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M1.5 2h13A1.5 1.5 0 0 1 16 3.5v9A1.5 1.5 0 0 1 14.5 14h-13A1.5 1.5 0 0 1 0 12.5v-9A1.5 1.5 0 0 1 1.5 2zm0 1a.5.5 0 0 0-.5.5v.77l7 4.2 7-4.2V3.5a.5.5 0 0 0-.5-.5h-13zM15 5.64l-6.54 3.93a.75.75 0 0 1-.92 0L1 5.64V12.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V5.64z" />
      </svg>
      <span ref={labelRef} />
    </button>
  );
}
