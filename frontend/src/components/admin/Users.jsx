import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../App"; // Ensure this is correctly imported
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import Cookies from 'js-cookie';
import axios from "axios";

export const Users = ({ errors }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/`);
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data.map(user => user.email));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const deleteUser = async (email) => {
    try {
      const adminIdFromCookie = Cookies.get("userId"); // Get admin ID from cookies
  
      if (!adminIdFromCookie) {
        throw new Error("Admin ID not found in cookies");
      }
  
      const response = await axios.delete(`${API_BASE_URL}/delete_user`, {
        headers: { admin_id: adminIdFromCookie }, // Send admin_id in headers
        params: { email }, // Send email as a query parameter
      });
  
      console.log(response.data);
  
      setUsers(users.filter(user => user !== email));
    } catch (error) {
      console.error("Error deleting user:", error.response ? error.response.data : error.message);
    }
  };
  
  

  return (
    <div className="container mt-4 p-4 bg-white shadow rounded">
      <h3 className="mb-3">Users</h3>
      <div className="list-group">
        {users.map((email, index) => (
          <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{email}</span>
            <button className="btn btn-danger btn-sm" onClick={() => deleteUser(email)}>Delete</button>
          </div>
        ))}
      </div>
      {errors?.userEmail && <div className="text-danger mt-2">{errors.userEmail.message}</div>}
    </div>
  );
};
