import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // This state will eventually be populated via GET /api/UserInformation/account/{accountId}
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Mocking the fetch on mount
  useEffect(() => {
    // If we had the real API integrated:
    // axios.get(`/api/UserInformation/account/${user.account_id}`).then(...)
    
    // For now, we'll just set some mock data or leave it empty to simulate a new profile
    setFormData({
      name: 'John Doe',
      phone: '0123456789',
      email: 'john.doe@example.com',
      address: '123 Main Street, Cityville'
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    
    // Mocking the save process (PUT/POST to API)
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 800);
  };

  return (
    <div className="profile-container">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>
        &larr; Back to Dashboard
      </button>
      <div className="profile-card">
        <h2 className="profile-title">Account Profile</h2>
        <p className="profile-subtitle">Manage your personal information</p>

        {successMsg && <div className="alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group readonly-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              value={user?.username || 'GuestUser'} 
              readOnly 
              className="form-input readonly-input"
            />
            <span className="help-text">Username cannot be changed at this time.</span>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name"
              value={formData.name} 
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              value={formData.email} 
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone"
              value={formData.phone} 
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea 
              id="address" 
              name="address"
              value={formData.address} 
              onChange={handleChange}
              className="form-input textarea-input"
              placeholder="Enter your full address"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
