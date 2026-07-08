import { AdminPage } from "./pages/AdminPage";
import { JudgePage } from "./pages/JudgePage";
import { ParticipantPage } from "./pages/ParticipantPage";
import { QuizAdminPage } from "./pages/QuizAdminPage";
import { QuizPage } from "./pages/QuizPage";

export default function App() {
  const pathname = window.location.pathname.toLowerCase();

  if (pathname.endsWith("/judge")) {
    return <JudgePage />;
  }

  if (pathname.endsWith("/admin")) {
    return <AdminPage />;
  }

  if (pathname.endsWith("/admin2")) {
    return <QuizAdminPage />;
  }

  if (pathname.endsWith("/quize") || pathname.endsWith("/quiz")) {
    return <QuizPage />;
  }

  return <ParticipantPage />;
}
