import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const TILES = [
  { to: "/tournaments/new", title: "Create Tournament", desc: "Set up an event and its side games." },
  { to: "/tournaments", title: "Tournaments", desc: "View and manage your events." },
  { to: "/tee-sheet", title: "Tee-Sheet Builder", desc: "Drag-and-drop pairings (next up)." },
  { to: "/sim-board", title: "Sim Board", desc: "Indoor bays and social rounds." },
];

export function DashboardHome() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">
        Welcome{user?.name ? `, ${user.name}` : ""}
      </h1>
      <p className="text-navy/60 mb-6">
        Plan your events on the big screen. Game-day actions stay on the phone.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TILES.map((t) => (
          <Link key={t.to} to={t.to} className="card hover:border-gold transition">
            <div className="font-semibold text-navy">{t.title}</div>
            <div className="text-sm text-navy/60 mt-1">{t.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
