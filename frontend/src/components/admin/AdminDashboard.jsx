import React from "react";
import { useLocation,useNavigate } from "react-router-dom";
import { ProjectForm } from "./ProjectForm";
import { ManageModules } from "./ManageModules";
import { AddTask } from "./AddTask";
import AssignProjectToDevelopers from "./AssignProjectToDevelopers";
import { AddUser } from "./AddUser";
import { AdminHome } from "./AdminHome";
import { Users } from "./Users";
import { ProjectList } from "./ProjectList";


export const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab");

  return (
    <div>
      <h2>Welcome Admin</h2>
      <hr />
      {activeTab === "home" && <AdminHome/>}
      {activeTab === "addDevelopers" && <AssignProjectToDevelopers />}
      {activeTab === "addProject" && <ProjectForm />}
      {activeTab === "manageModules" && <ManageModules/>}
      {activeTab === "addTask" && <AddTask />}
      {activeTab === "addUser" && <AddUser />}
      {activeTab === "users" && <Users />}
      {activeTab === "listProjects" && <ProjectList />}
    </div>
  );
};
