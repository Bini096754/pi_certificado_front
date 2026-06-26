import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import StudentDashboard from "../pages/StudentDashboard";
import CoordinatorDashboard from "../pages/CoordinatorDashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/aluno" element={<StudentDashboard />} />
        <Route path="/coordenador" element={<CoordinatorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
