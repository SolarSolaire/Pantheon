import React from 'react';
import {Navigate} from 'react-router-dom';

// gets the current session token and navigates to the login page if it exists
export default function ProtectedRoute({children}) {
    const token = localStorage.getItem('pantheon_token');
    return token ? children : <Navigate to="/login" replace />
}