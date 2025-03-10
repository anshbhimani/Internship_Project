import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export const TasksPage = () => {
  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-center mb-3">Tasks</h2>
          <ul className="list-group">
            <li className="list-group-item">Task 1 - Assigned to Developer 1</li>
            <li className="list-group-item">Task 2 - Assigned to Developer 2</li>
            <li className="list-group-item">Task 3 - In Progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
