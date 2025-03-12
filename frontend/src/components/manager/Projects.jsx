import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { API_BASE_URL } from "../../App";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [developerMap, setDeveloperMap] = useState({});
  const [loading, setLoading] = useState(true);
  const managerId = Cookies.get("userId");
  const [modulesMap, setModulesMap] = useState({});
  const [statusesMap, setStatusesMap] = useState({});


  useEffect(() => {
    fetchManagerProjects();
  }, []);

  const fetchManagerProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/managers/${managerId}/projects/`);
      const projectsData = response.data;
      setProjects(projectsData);

      // Fetch developers for each project
      projectsData.forEach((project) => {
        fetchProjectDevelopers(project._id)
        fetchProjectModules(project._id)
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setLoading(false);
    }
  };

  const fetchProjectModules = async (projectId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/modules/${projectId}/modules-statuses/`);
      const { modules, statuses } = response.data;
      console.log("Module and status" + response.data);
      
  
      // Map statuses by ID
      const statusLookup = {};
      statuses.forEach((status) => {
        statusLookup[status._id] = status.statusName;
      });
  
      setStatusesMap((prev) => ({
        ...prev,
        ...statusLookup,  // Merge new statuses into the existing map
      }));
  
      setModulesMap((prev) => ({
        ...prev,
        [projectId]: modules,  // Store modules for this project
      }));
    } catch (error) {
      console.error("Error fetching project modules:", error);
    }
  };
  

  const fetchProjectDevelopers = async (projectId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/developers`);
      
      // Store developer details (name & email) mapped to the project ID
      setDeveloperMap((prev) => ({
        ...prev,
        [projectId]: response.data,  // Store array of developers for this project
      }));
    } catch (error) {
      console.error("Error fetching project developers:", error);
    }
  };
  

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      {loading ? (
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Grid>
      ) : projects.length > 0 ? (
        projects.map((project) => (
          <Grid item xs={12} md={6} key={project._id}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardHeader
                title={project.title}
                subheader={`Start Date: ${project.startDate} | Completion: ${project.completionDate}`}
              />
              <CardContent>
                <Typography variant="body1">{project.description}</Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Technology:</strong> {project.technology}
                </Typography>

                {/* Developers List */}
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Developers:</strong>
                </Typography>
                {developerMap[project._id]?.length > 0 ? (
                  developerMap[project._id].map((dev) => (
                    <Chip 
                      key={dev._id} 
                      label={`${dev.firstname} (${dev.email})`} 
                      sx={{ m: 0.5 }} 
                    />
                  ))
                ) : (
                  <Typography variant="body2">No developers assigned.</Typography>
                )}

                
                {/* Modules with Expandable Details */}
              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>Modules:</strong>
              </Typography>
              {modulesMap[project._id]?.length > 0 ? (
                modulesMap[project._id].map((module) => (
                  <Accordion key={module._id} sx={{ mt: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{module.moduleName}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2"><strong>Description:</strong> {module.description}</Typography>
                      <Typography variant="body2"><strong>Estimated Hours:</strong> {module.estimatedHours}</Typography>
                      <Typography variant="body2"><strong>Start Date:</strong> {module.startDate}</Typography>
                      <Typography variant="body2"><strong>Status:</strong> {statusesMap[module.status] || "Unknown"}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Typography variant="body2">No modules available.</Typography>
              )}

              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Typography variant="h6" sx={{ textAlign: "center", width: "100%" }}>
          No projects available.
        </Typography>
      )}
    </Grid>
  );
};
