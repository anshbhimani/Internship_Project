import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Avatar, 
  Checkbox, 
  FormControlLabel, 
  Grid, 
  Link, 
  Divider,
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from 'axios';
import { API_BASE_URL } from "../../App";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import './Login.css';

export const Login = ({ setUserRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Trigger animation after component mount
    const timer = setTimeout(() => {
      setShowForm(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });

      if (response.data.role) {
        setUserRole(response.data.role);
        // expires in 1 hour out of 24 hours
        Cookies.set("userId", response.data.user_id, { expires: 1 / 24 });
        Cookies.set("role", response.data.role, { expires: 1 / 24 });
        Cookies.set("name", response.data.name, { expires: 1 / 24 });
        
        // Success animation before navigation
        setTimeout(() => {
          navigate(`/profile/${response.data.role}?tab=home`);
        }, 1000);
      } else {
        setIsLoading(false);
        alert("Login failed: Role not assigned");
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      alert(error.response?.data?.detail || "Invalid credentials!");
    }
  };

  return (
    <Box className="login-background">
      <div className="animated-background">
        <div className="gradient-1"></div>
        <div className="gradient-2"></div>
        <div className="gradient-3"></div>
      </div>
      
      <Container maxWidth="md" className="login-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Paper
            elevation={24}
            className="login-paper"
          >
            {/* Decorative elements */}
            <div className="decorative-circle circle-1"></div>
            <div className="decorative-circle circle-2"></div>
            <div className="decorative-circle circle-3"></div>
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <Avatar className="login-avatar">
                <LockOutlinedIcon fontSize="large" />
              </Avatar>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Typography component="h1" variant="h4" className="login-title">
                Welcome Back
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Typography variant="body2" color="textSecondary" className="login-subtitle">
                Enter your credentials to access your account
              </Typography>
            </motion.div>
            
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Box component="form" onSubmit={handleLogin} className="login-form">
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-field"
                      InputProps={{
                        style: { fontSize: '1.1rem', padding: '12px 14px' }
                      }}
                      InputLabelProps={{
                        style: { fontSize: '1.1rem' }
                      }}
                    />
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    transition={{ type: "spring", stiffness: 400 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-field"
                      InputProps={{
                        style: { fontSize: '1.1rem', padding: '12px 14px' }
                      }}
                      InputLabelProps={{
                        style: { fontSize: '1.1rem' }
                      }}
                    />
                  </motion.div>
                  
                
                  <motion.div 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isLoading}
                      className="signin-button"
                      size="large"
                    >
                      {isLoading ? (
                        <CircularProgress size={28} color="inherit" />
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="signup-container"
                  >
                  </motion.div>
                </Box>
              </motion.div>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};