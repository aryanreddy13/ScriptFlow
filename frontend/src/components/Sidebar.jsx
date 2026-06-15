import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', shortcut: '01' },
  { path: '/scripts', label: 'Scripts', shortcut: '02' },
  { path: '/scheduler', label: 'Scheduler', shortcut: '03' },
  { path: '/history', label: 'History', shortcut: '04' },
  { path: '/logs', label: 'Logs', shortcut: '05' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { currentUser, logout } = useAuth();

  return (
    <>
      <aside className="hidden w-80 flex-col border-r border-panelBorder bg-brandBg text-[#EAEAEA] lg:flex">
        <div className="flex h-full flex-col justify-between px-5 py-6">
          <div>
            <div className="mb-10 flex items-center gap-2 border-b border-panelBorder pb-5">
              <img src="/logo.png" alt="ScriptFlow Logo" className="h-9 w-9 rounded object-cover" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#EAEAEA]">ScriptFlow</p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#9CA3AF]">Operations Console</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded border border-transparent px-4 py-3 text-sm tracking-[0.14em] transition ${
                      isActive
                        ? 'border-brandAccent bg-[#111111] text-[#EAEAEA]'
                        : 'text-[#9CA3AF] hover:border-[#333] hover:bg-[#111111] hover:text-[#EAEAEA]'
                    }`
                  }
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-[#9CA3AF]">{item.shortcut}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="rounded border border-panelBorder bg-[#111111] p-4 text-sm text-[#D4D4D8]">
            <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#9CA3AF]">Signed in as</div>
            <div className="mb-4 truncate font-mono text-[#EAEAEA]">{currentUser?.email || 'anonymous@local'}</div>
            <button
              onClick={logout}
              className="w-full rounded border border-panelBorder bg-[#0A0A0A] py-2 text-[10px] uppercase tracking-[0.18em] text-[#EAEAEA] transition hover:border-brandAccent"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <aside className="relative z-10 h-full w-72 border-r border-panelBorder bg-brandBg p-5">
            <div className="mb-10 flex items-center gap-2">
              <img src="/logo.png" alt="ScriptFlow Logo" className="h-9 w-9 rounded object-cover" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#EAEAEA]">ScriptFlow</p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#71717A]">Operations</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded border border-transparent px-4 py-3 text-sm tracking-[0.14em] transition ${
                      isActive
                        ? 'border-brandAccent bg-[#111111] text-[#EAEAEA]'
                        : 'text-[#9CA3AF] hover:border-[#333] hover:bg-[#111111] hover:text-[#EAEAEA]'
                    }`
                  }
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-[#9CA3AF]">{item.shortcut}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-10 rounded border border-panelBorder bg-[#111111] p-4 text-sm text-[#D4D4D8]">
              <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#9CA3AF]">Signed in as</div>
              <div className="mb-4 truncate font-mono text-[#EAEAEA]">{currentUser?.email || 'anonymous@local'}</div>
              <button
                onClick={logout}
                className="w-full rounded border border-panelBorder bg-[#0A0A0A] py-2 text-[10px] uppercase tracking-[0.18em] text-[#EAEAEA] transition hover:border-brandAccent"
              >
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
