import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TasksPage } from "../common/Tasks";

export const DeveloperDashboard = () => {
  const location = useLocation();
  
  // Extract tab name from URL search params
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab");

  return (
    <div>
      <h1>Welcome Developer</h1>
      <hr/>
      {/* Render the selected component below */}
      <div className="mt-4">
        {activeTab === "viewTasks" && <TasksPage />}
      </div>
    </div>
  );
};
