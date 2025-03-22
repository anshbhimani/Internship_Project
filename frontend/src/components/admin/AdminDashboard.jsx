import React from "react";
import { useLocation,useNavigate } from "react-router-dom";
import { ProjectForm } from "./ProjectForm";
import { AddModule } from "./AddModule";
import { AddTask } from "./AddTask";
import AssignProjectToDevelopers from "./AssignProjectToDevelopers";
import { AddUser } from "./AddUser";



export const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab");

  return (
    <div>
      <h2>Welcome Admin</h2>
      <hr />
      {activeTab === "addDevelopers" && <AssignProjectToDevelopers />}
      {activeTab === "addProject" && <ProjectForm />}
      {activeTab === "addModule" && <AddModule/>}
      {activeTab === "addTask" && <AddTask />}
      {activeTab === "addUser" && <AddUser />}
    </div>
  );
};
