import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../App";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  IconButton,
  Menu,
  Button,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  CircularProgress,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import "./Tasks.css";

export const TasksPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [userTaskAssignments, setUserTaskAssignments] = useState({});
  const [taskModules, setTaskModules] = useState({});
  const [anchorEl, setAnchorEl] = useState(null); // For dropdown menu
  const [selectedTask, setSelectedTask] = useState(null); // Track selected task for status change
  const [statuses, setStatuses] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const userId = Cookies.get("userId");
  const priorityColors = {
    High: "#e63d37", // High priority (red)
    Medium: "#dbba14", // Yellow
    Low: "#a2d6de ", // Low priority (blue)
  };

  const handleDeassign = async (taskId, userId) => {
    if (
      !window.confirm(
        "Are you sure you want to deassign this user from the task?"
      )
    )
      return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/user-tasks/${userId}/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to deassign user from task");

      alert("User deassigned successfully!");

      // Update UI by removing only the specific user from the task
      setUserTaskAssignments((prevAssignments) => {
        const updatedAssignments = { ...prevAssignments };
        updatedAssignments[taskId] = updatedAssignments[taskId]?.filter(
          (user) => user._id !== userId
        );
        return updatedAssignments;
      });
    } catch (error) {
      console.error("Error deassigning user from task:", error);
      alert("Failed to deassign user from task");
    }
  };

  // Fetch projects
  useEffect(() => {
    const userRole = Cookies.get("role");
    setRole(userRole);

    const fetchProjects = async () => {
      try {
        const url =
          userRole === "manager"
            ? `${API_BASE_URL}/managers/${userId}/projects/`
            : `${API_BASE_URL}/developer/${userId}/`;
        const response = await axios.get(url);
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/status/status`);
        setStatuses(response.data);
      } catch (error) {
        console.error("Error fetching statuses:", error);
      }
    };
  
    fetchStatuses();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const url =
        role === "manager"
          ? `${API_BASE_URL}/tasks/${selectedProject._id}`
          : `${API_BASE_URL}/tasks/developer/${userId}/${selectedProject._id}`;

      const res = await axios.get(url);
      const taskList = res.data;
      setTasks(taskList);

      // Fetch task details (assigned users & modules)
      const userAssignments = {};
      const moduleMappings = {};
      const statusMappings = {};

      await Promise.all(
        taskList.map(async (task) => {
          try {
            // Fetch users assigned to the task
            const userRes = await axios.get(
              `${API_BASE_URL}/user-tasks/task/${task._id}`
            );
            userAssignments[task._id] = userRes.data.map((user) => ({
              _id: user.user_id, // Ensure this exists
              full_name: user.full_name, // Ensure this exists
            }));
          } catch (error) {
            console.error(`Error fetching users for task ${task._id}:`, error);
          }

          if (task.module_id) {
            try {
              // Fetch module details
              const moduleRes = await axios.get(
                `${API_BASE_URL}/modules/${task.module_id}`
              );
              moduleMappings[task._id] = moduleRes.data; 
            } catch (error) {
              console.error(`Error fetching module for task ${task._id}:`, error);
              moduleMappings[task._id] = "Unknown Module";
            }
          }

          if (task.status_id) {
            try {
              // Fetch status name
              const statusRes = await axios.get(
                `${API_BASE_URL}/status/status/${task.status_id}`
              );
              statusMappings[task._id] = statusRes.data.status;
            } catch (error) {
              console.error(`Error fetching status for task ${task._id}:`, error);
              statusMappings[task._id] = "Unknown Status";
            }
          }
        })
      );

      setUserTaskAssignments(userAssignments);
      setTaskModules(moduleMappings);
      setTasks((prevTasks) =>
        prevTasks.map((task) => ({
          ...task,
          statusName: statusMappings[task._id] || "Unknown Status",
        }))
      );
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks based on selected project
  useEffect(() => {
    if (!selectedProject) return;
    fetchTasks();
    }, [selectedProject, role, userId]);
  
    // Handle status update
  const handleStatusUpdate = async (taskId, statusId) => {
    if (!taskId) return; 
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tasks/${taskId}/status/${statusId}`
      );
      if (response.status === 200) {
        fetchTasks();
        setAnchorEl(null); // Close the menu after updating status
        alert("Status updated successfully!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleClick = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task); // Set the selected task for status change
  };

  // Handle menu closing
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      <h1>View Tasks</h1>
      <hr className="custom-hr"></hr>
      {loading ? (
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Grid>
      ) : (
        <>
          {/* Project Selection Dropdown */}
          <Grid item xs={12} sx={{ mb: 2 }}>
            <FormControl
              fullWidth
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: 2,
                boxShadow: 2,
                p: 1,
                "& .MuiInputBase-root": {
                  borderRadius: 2,
                  fontSize: "16px",
                  fontWeight: "bold",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#1565c0",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0d47a1",
                },
                transition: "0.3s",
              }}
            >
              <Select
                value={selectedProject ? selectedProject._id : ""}
                onChange={(e) => {
                  const project = projects.find(
                    (proj) => proj._id === e.target.value
                  );
                  setSelectedProject(project);
                }}
                displayEmpty
              >
                <MenuItem disabled value="">
                  <em>Select a project</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem
                    key={project._id}
                    value={project._id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#bbdefb",
                      },
                    }}
                  >
                    {project.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Task List */}
          {selectedProject && (
            <Grid item xs={12}>
              <Grid container spacing={3}>
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <Card
                      key={task._id}
                      sx={{
                        boxShadow: 4,
                        borderRadius: 3,
                        mb: 3,
                        backgroundColor: priorityColors[task.priority] || "#f9f9f9",
                        transition: "0.3s",
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardHeader
                        title={
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", color: "#0d47a1" }}
                          >
                            {task.title}
                          </Typography>
                        }
                        subheader={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold", color: "#ff5722" }}
                          >
                            Priority: {task.priority}
                          </Typography>
                        }
                        sx={{
                          backgroundColor:
                            task.priority === "High"
                              ? "#ffebee"
                              : task.priority === "Medium"
                              ? "#fff3e0"
                              : "#e8f5e9",
                        }}
                      />
                      <CardContent>
                        {task.ui_image_url && (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<VisibilityIcon />}
                            onClick={() => setSelectedImage(task.ui_image_url)}
                          >
                            View UI Image
                          </Button>
                        )}
                        <Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)} maxWidth="md">
                        <DialogTitle>
                          Task Image
                          <IconButton
                            edge="end"
                            color="inherit"
                            onClick={() => setSelectedImage(null)}
                            sx={{ position: "absolute", right: 8, top: 8 }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </DialogTitle>
                        <DialogContent>
                          {selectedImage && (
                            <img src={selectedImage} alt="Task" style={{ width: "100%" }} />
                          )}
                        </DialogContent>
                      </Dialog>
                      </CardContent>
                      <CardContent>
                        <Typography variant="body2">
                          <strong>Description:</strong> {task.description}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Assigned to:</strong>
                          <span>
                            {userTaskAssignments[task._id]?.length > 0
                              ? userTaskAssignments[task._id].map((user) => (
                                  <Chip
                                    key={user._id}
                                    label={user.full_name}
                                    onDelete={role === "manager" ? () => handleDeassign(task._id, user._id) : undefined} 
                                    sx={{
                                      m: 0.5,
                                      backgroundColor: "#ff9800",
                                      color: "white",
                                      "& .MuiChip-deleteIcon": {
                                        color: role === "manager" ? "#d32f2f" : "transparent", // Hide delete icon for developers
                                      },
                                    }}
                                  />
                                ))
                              : "Not assigned"}
                          </span>
                        </Typography>
                        

                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Time Allotted:</strong> {task.totalMinutes}{" "}
                          minutes
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Task Status:</strong> {task.statusName || "Loading..."}
                          <IconButton onClick={(e) => handleClick(e, task)}>
                            <EditIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                            transformOrigin={{ vertical: "top", horizontal: "left" }}
                          >
                            {statuses.length > 0 ? (
                              statuses.map((status) => (
                                <MenuItem
                                  key={status._id}
                                  onClick={() => handleStatusUpdate(selectedTask?._id, status._id)}
                                >
                                  {status.status}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>Loading...</MenuItem>
                            )}
                          </Menu>

                        </Typography>
                      </CardContent>
                      {/* Module Details */}
                      <Accordion sx={{ backgroundColor: "#f5f5f5" }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold", color: "#1565c0" }}
                          >
                            Module Details
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>                          
                          {taskModules[task._id] ? (
                            <>
                              <Typography variant="body2">
                                <strong>Module Name:</strong> {taskModules[task._id].moduleName}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Description:</strong> {taskModules[task._id].description}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Estimated Hours:</strong> {taskModules[task._id].estimatedHours}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Start Date:</strong> {taskModules[task._id].startDate}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2">No module assigned</Typography>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    </Card>
                  ))
                ) : (
                  <Typography variant="h6" sx={{ textAlign: "center", mt: 3 }}>
                    No tasks available for this project.
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};