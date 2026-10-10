import React, { useEffect, useState } from 'react';
import api from './api/axios';
import Home from "./pages/Home";


export default function App() {
  const [backendStatus, setBackendStatus] = useState('Connecting to backend...');
  useEffect(() => {
    // Ping backend server running on port 5000
    api.get('/health')
      .then((res) => setBackendStatus(res.data.message))
      .catch((err) => setBackendStatus(`Backend offline or CORS issue: ${err.message}`));

  }, []);
    return <Home />;
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Pantheon Movie Tracker</h1>
      <p style={{ color: '#666' }}>Frontend is live on port 5173!</p>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        borderRadius: '8px', 
        backgroundColor: '#f0f4f8',
        border: '1px solid #d0d7de' 
      }}>
        <strong>Backend Status (Port 5001):</strong>
        <p style={{ margin: '8px 0 0 0', fontWeight: 'bold' }}>{backendStatus}</p>

        

      </div>
    </div>
    
  );
  
}