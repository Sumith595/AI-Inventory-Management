import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Card, CardContent } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signup({ name, email, password });
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#120d38,#432b8d)' }}>
      <Card sx={{ width: 480, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 800 }}>Create account</Typography>
          <form onSubmit={handleSubmit}>
            <TextField label="Full name" fullWidth margin="normal" value={name} onChange={(e)=>setName(e.target.value)} />
            <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e)=>setPassword(e.target.value)} />
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} fullWidth>Create account</Button>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">Already have an account? <Link to="/">Sign in</Link></Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
