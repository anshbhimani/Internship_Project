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
// const hoverShade = "#70E4EF"; // Vibrant Blue
const backgroundColor = "#F7F9FC"; // Very Light Gray

const StyledCard = styled(Card)(() => ({
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  backgroundColor: lightShade,  // Light background for card
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
    // backgroundColor: hoverShade, // Hover effect with vibrant blue
  },
}));

const StyledChip = styled(Chip)(() => ({
  backgroundColor: baseColor,  // Bright blue for chips
  color: '#fff',
  '&:hover': {
    backgroundColor: darkShade, // Dark blue on hover
  },
  margin: '4px',
}));

const StyledAccordion = styled(Accordion)(() => ({
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  marginTop: '10px',
  '& .MuiAccordionSummary-root': {
    backgroundColor: lightShade,  // Soft blue for accordion summary
  },
  '& .MuiAccordionDetails-root': {
    backgroundColor: backgroundColor,  // Very light gray for accordion details
  },
}));


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

      // Fetch developers and modules for each project
      projectsData.forEach((project) => {
        fetchProjectDevelopers(project._id);
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
      const response = await axios.get(`${API_BASE_URL}/status/${projectId}/modules-statuses/`);
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

  const fetchProjectDevelopers = async (projectId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/developers`);
      setDeveloperMap((prev) => ({
        ...prev,
        [projectId]: response.data,
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
            <StyledCard>
              <CardHeader
                title={project.title}
                subheader={`Start Date: ${project.startDate} | Completion: ${project.completionDate}`}
                sx={{ backgroundColor: darkShade, color: '#fff',
                  '& .MuiCardHeader-subheader': {
                   color: '#fff',}
                 }} // Dark background for header
              />
              <CardContent>
                <Typography variant="body1" sx={{ color: darkShade }}>
                  {project.description}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, color: darkShade }}>
                  <strong>Technology:</strong> {project.technology}
                </Typography>

                <Typography variant="body2" sx={{ mt: 2, color: darkShade }}>
                  <strong>Developers:</strong>
                </Typography>
                {developerMap[project._id]?.length > 0 ? (
                  developerMap[project._id].map((dev) => (
                    <StyledChip key={dev._id} label={`${dev.firstname} (${dev.email})`} />
                  ))
                ) : (
                  <Typography variant="body2">No developers assigned.</Typography>
                )}

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
          No projects available.
        </Typography>
      )}
    </Grid>
  );
};
