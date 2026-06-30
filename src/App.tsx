import { AdminPage } from "./pages/AdminPage";
import { JudgePage } from "./pages/JudgePage";
import { ParticipantPage } from "./pages/ParticipantPage";

export default function App() {
  const pathname = window.location.pathname.toLowerCase();

  if (pathname.endsWith("/judge")) {
    return <JudgePage />;
  }

  if (pathname.endsWith("/admin")) {
    return <AdminPage />;
  }

  return <ParticipantPage />;
}
