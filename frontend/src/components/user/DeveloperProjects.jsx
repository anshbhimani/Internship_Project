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
import { styled } from '@mui/material/styles';

const baseColor = "#4A90E2";  // Bright Blue
const lightShade = "#D6E4F0"; // Soft Light Blue
const darkShade = "#255C99";  // Dark Blue
const backgroundColor = "#F7F9FC"; // Very Light Gray

const StyledCard = styled(Card)(() => ({
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  backgroundColor: lightShade,  
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
  },
}));

const StyledChip = styled(Chip)(() => ({
  backgroundColor: baseColor,
  color: '#fff',
  '&:hover': {
    backgroundColor: darkShade,
  },
  margin: '4px',
}));

const StyledAccordion = styled(Accordion)(() => ({
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  marginTop: '10px',
  '& .MuiAccordionSummary-root': {
    backgroundColor: lightShade,
  },
  '& .MuiAccordionDetails-root': {
    backgroundColor: backgroundColor,
  },
}));

export const DeveloperProjects = () => {
  const [projects, setProjects] = useState([]);
  const [modulesMap, setModulesMap] = useState({});
  const [statusesMap, setStatusesMap] = useState({});
  const [loading, setLoading] = useState(true);

  const developerId = Cookies.get("userId");
  console.log("Developer ID:", developerId);  // Debugging log
  const developerName = Cookies.get("name");


  useEffect(() => {
    console.log("DeveloperProjects Mounted");
    fetchDeveloperProjects();
  }, []);

  const fetchDeveloperProjects = async () => {
    try {
      console.log("Fetching developer projects...");  // Debugging log
      const response = await axios.get(`${API_BASE_URL}/developer/${developerId}`);
      console.log("Projects Data:", response.data);  // Log response data
      const projectsData = response.data;
      setProjects(projectsData);
  
      projectsData.forEach((project) => {
        fetchProjectModules(project._id);
      });
  
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setLoading(false);
    }
  };  

  const fetchProjectModules = async (projectId) => {
    try {
      console.log(`Fetching modules for project ID: ${projectId}`);  // Debugging log
      const response = await axios.get(`${API_BASE_URL}/status/${projectId}/modules-statuses/`);
      console.log("Modules Response:", response.data);
  
      const { modules, statuses } = response.data;
      const statusLookup = {};
      statuses.forEach((status) => {
        statusLookup[status._id] = status.statusName;
      });
  
      setStatusesMap((prev) => ({
        ...prev,
        ...statusLookup,
      }));
  
      setModulesMap((prev) => ({
        ...prev,
        [projectId]: modules,
      }));
    } catch (error) {
      console.error("Error fetching project modules:", error);
    }
  };
  

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      <h1>Assigned Projects</h1>
      <hr className="custom-hr"></hr>
      {loading ? (
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Grid>
      ) : projects.length > 0 ? (
        projects.map((project) => (
          <Grid item xs={12} md={6} key={project._id}>
            <StyledCard>
              <CardHeader
                title={project.title}
                subheader={`Start Date: ${project.startDate} | Completion: ${project.completionDate}`}
                sx={{ backgroundColor: darkShade, color: '#fff',
                  '& .MuiCardHeader-subheader': {
                   color: '#fff',}
                 }} 
              />
              <CardContent>
                <Typography variant="body1" sx={{ color: darkShade }}>
                  {project.description}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, color: darkShade }}>
                  <strong>Technology:</strong> {project.technology}
                </Typography>

                <Typography variant="body2" sx={{ mt: 2, color: darkShade }}>
                  <strong>Modules:</strong>
                </Typography>
                {modulesMap[project._id]?.length > 0 ? (
                  modulesMap[project._id].map((module) => (
                    <StyledAccordion key={module._id}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{module.moduleName}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ color: darkShade }}>
                          <strong>Description:</strong> {module.description}
                        </Typography>
                        <Typography variant="body2" sx={{ color: darkShade }}>
                          <strong>Estimated Hours:</strong> {module.estimatedHours}
                        </Typography>
                        <Typography variant="body2" sx={{ color: darkShade }}>
                          <strong>Start Date:</strong> {module.startDate}
                        </Typography>
                        <Typography variant="body2" sx={{ color: darkShade }}>
                          <strong>Status:</strong> {statusesMap[module.status] || "Unknown"}
                        </Typography>
                      </AccordionDetails>
                    </StyledAccordion>
                  ))
                ) : (
                  <Typography variant="body2">No modules available.</Typography>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        ))
      ) : (
        <Typography variant="h6" sx={{ textAlign: "center", width: "100%", color: darkShade }}>
          No projects assigned.
        </Typography>
      )}
    </Grid>
  );
};
