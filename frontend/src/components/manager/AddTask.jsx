import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export const AddTask = () => {
  const [task, setTask] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Task Added: ${task}`);
    setTask("");
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-center mb-3">Add New Task</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter task"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Add Task
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
