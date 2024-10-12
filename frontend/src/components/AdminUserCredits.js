import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminUserCredits = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const addCredits = async (userId, credits) => {
    try {
      await api.post(`/users/${userId}/credits`, { credits });
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error adding credits:', error);
      setError('Failed to add credits');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage User Credits</h2>
      {users.map(user => (
        <div key={user._id} className="mb-4 p-4 border rounded">
          <p className="font-bold">{user.username} - Credits: {user.credits}</p>
          <div className="mt-2">
            <input
              type="number"
              min="1"
              placeholder="Credits to add"
              className="p-2 border rounded mr-2"
              id={`credits-${user._id}`}
            />
            <button
              onClick={() => {
                const credits = document.getElementById(`credits-${user._id}`).value;
                addCredits(user._id, credits);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Credits
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminUserCredits;