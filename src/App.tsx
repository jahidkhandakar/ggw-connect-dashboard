import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { DashboardHome } from "./pages/DashboardHome";
import { Tournaments } from "./pages/Tournaments";
import { CreateTournament } from "./pages/CreateTournament";
import { TeeSheetBuilder } from "./pages/TeeSheetBuilder";
import { ComingSoon } from "./pages/ComingSoon";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="tournaments" element={<Tournaments />} />
        <Route path="tournaments/new" element={<CreateTournament />} />
        <Route path="tee-sheet" element={<TeeSheetBuilder />} />
        <Route path="sim-board" element={<ComingSoon title="Sim Board" />} />
        <Route path="flights" element={<ComingSoon title="Flight Management" />} />
        <Route
          path="members"
          element={<ComingSoon title="Private Club Members" />}
        />
      </Route>
    </Routes>
  );
}
