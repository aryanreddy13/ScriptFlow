export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded border border-panelBorder bg-[#111111] shadow-xl ring-1 ring-white/10">
        <div className="flex items-center justify-between border-b border-panelBorder px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#EAEAEA]">{title}</h2>
          <button
            onClick={onClose}
            className="text-sm text-[#9CA3AF] hover:text-[#EAEAEA]"
          >
            Close
          </button>
        </div>
        <div className="p-5 text-sm text-[#D4D4D8]">{children}</div>
      </div>
    </div>
  );
}
