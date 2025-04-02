import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Login } from "./components/common/Login";
import { DeveloperDashboard } from "./components/user/DeveloperDashboard";
import { UserSidebar } from "./components/layouts/UserSidebar";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ProjectForm } from "./components/admin/ProjectForm";
import { ManagerDashboard } from "./components/manager/ManagerDashboard";
import { ErrorPage } from "./components/Error/ErrorPage";
import { TasksPage } from "./components/common/Tasks";
import { AddTask } from "./components/admin/AddTask";
import { ManageModules } from "./components/admin/ManageModules"; 
import { AssignTask } from "./components/manager/AssignTask";
import { AddUser } from "./components/admin/AddUser";
import { Users } from "./components/admin/Users";
import { ProjectList } from "./components/admin/ProjectList";

export const API_BASE_URL = "http://localhost:6565";

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole")); // Get role from localStorage
  const navigate = useNavigate();

  const handleLogout = () => {
    setUserRole(null); // Clear role

    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="layout-fixed sidebar-expand-lg bg-body-tertiary sidebar-open app-loaded">
      <div className="container-fluid">
        <div className="row">
          {/* ✅ Sidebar will always be visible if userRole exists */}
          {userRole && <UserSidebar userRole={userRole} onLogout={handleLogout} />}
          <div className={`col-md-10 ${userRole ? "p-4" : "d-flex justify-content-center align-items-center vh-100"}`}>
            <Routes>
              <Route path="/login" element={<Login setUserRole={setUserRole} />} />
              <Route path="/profile/:userRole" element={<ErrorPage />} />

              {/* Conditional Dashboard Routes */}
              <Route path="/profile/admin" element={userRole === "admin" ? <AdminDashboard /> : <Navigate to="/login" />} />
              <Route path="/admin/add_project" element={userRole === "admin" ? <ProjectForm /> : <Navigate to="/login" />} />
              <Route path="/admin/add_user" element={userRole === "admin" ? <AddUser /> : <Navigate to="/login" />} />
              <Route path="/admin/users" element={userRole === "admin" ? <Users /> : <Navigate to="/login" />} />
              <Route path="/admin/projects" element={userRole === "admin" ? <ProjectList /> : <Navigate to="/login" />} />
              <Route path="/profile/manager" element={userRole === "manager" ? <ManagerDashboard /> : <Navigate to="/login" />} />
              <Route path="/profile/developer" element={userRole === "developer" ? <DeveloperDashboard /> : <Navigate to="/login" />} />

              {/* New Routes for Tasks and AddModule */}
              <Route path="/manager/add_task" element={userRole === "manager" ? <AddTask /> : <Navigate to="/login" />} />
              <Route path="/manager/add_module" element={userRole === "manager" ? <ManageModules /> : <Navigate to="/login" />} />
              <Route path="/manager/assign_task" element={userRole === "manager" ? <AssignTask /> : <Navigate to="/login" />} />
              
              {/* Redirect unknown routes to login */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
