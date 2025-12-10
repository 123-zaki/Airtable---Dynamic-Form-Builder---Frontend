import { Routes, Route, Navigate } from "react-router-dom";

// import your pages
import Dashboard from "./pages/Dashboard.jsx";
import CreateForm from "./pages/CreateForm.jsx";
import FormPage from "./pages/FormPage.jsx";
import ResponsesPage from "./pages/ResponsesPage.jsx";
import AirtableLogin from "./pages/AirtableLogin.jsx";

export default function App() {
  return (
    <Routes>
      {/* Default route – send to dashboard (which can redirect to /login if not logged in) */}
      <Route path="/" element={<Dashboard />} />

      {/* Auth */}
      <Route path="/login" element={<AirtableLogin />} />

      {/* Form builder */}
      <Route path="/create-form" element={<CreateForm />} />

      {/* Form viewer */}
      <Route path="/form/:formId" element={<FormPage />} />

      {/* Responses list (optional admin view) */}
      <Route path="/forms/:formId/responses" element={<ResponsesPage />} />

      {/* Catch-all: redirect unknown routes to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
