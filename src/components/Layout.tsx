import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// Priority order per spec §14: tournament creation + tee sheet first, then sim
// board, flights, and private-club slots last.
const NAV = [
  { to: "/", label: "Overview", end: true },
  { to: "/tournaments", label: "Tournaments" },
  { to: "/tournaments/new", label: "Create Tournament" },
  { to: "/tee-sheet", label: "Tee-Sheet Builder" },
  { to: "/sim-board", label: "Sim Board" },
  { to: "/flights", label: "Flight Management" },
  { to: "/members", label: "Private Club Members" },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-navy text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="text-gold font-bold text-lg leading-tight">
            GGW Connect
          </div>
          <div className="text-white/50 text-xs">Creator Dashboard</div>
        </div>
        <nav className="flex-1 py-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-5 py-2.5 text-sm transition border-l-2 ${
                  isActive
                    ? "border-gold bg-white/5 text-gold"
                    : "border-transparent text-white/75 hover:bg-white/5"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10 text-xs text-white/50">
          Creator-scoped · your clubs & events
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="text-navy/70 text-sm">
            Signed in as{" "}
            <span className="font-semibold text-navy">
              {user?.name ?? user?.email ?? "Creator"}
            </span>
          </div>
          <button
            className="btn-outline text-sm py-1.5"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Sign out
          </button>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
