const badgeStyles = {
  success: 'bg-[#112f1a] text-[#22C55E] border border-[#164f2f]',
  failed: 'bg-[#2f1115] text-[#EF4444] border border-[#7f1d1d]',
  running: 'bg-[#2f2a0f] text-[#EAB308] border border-[#a16207]',
};

export default function StatusBadge({ variant = 'running', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${badgeStyles[variant]}`}>
      {children}
    </span>
  );
}
