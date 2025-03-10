import React from "react";
import { useLocation,useNavigate } from "react-router-dom";
import { ProjectForm } from "./ProjectForm";
export const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab");

  return (
    <div>
      <h2>Welcome Admin</h2>
      <hr />
      {activeTab === "addProject" && <ProjectForm />}
    </div>
  );
};
