import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchHouses();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again later.');
    }
  };

  const fetchHouses = async () => {
    try {
      const response = await api.get('/houses');
      setHouses(response.data);
    } catch (error) {
      console.error('Error fetching houses:', error);
      setError('Failed to fetch houses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(user => user._id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const assignHouse = async (userId, houseId) => {
    try {
      await api.post(`/users/${userId}/assign-house`, { houseId });
      fetchUsers(); // Refresh the user list to show updated assignments
    } catch (error) {
      console.error('Error assigning house:', error.response?.data || error.message);
      setError('Failed to assign house. Please try again.');
    }
  };

  const removeHouse = async (userId, houseId) => {
    try {
      await api.post(`/users/${userId}/remove-house`, { houseId });
      fetchUsers(); // Refresh the user list to show updated assignments
    } catch (error) {
      console.error('Error removing house:', error.response?.data || error.message);
      setError('Failed to remove house. Please try again.');
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Username</th>
            <th className="text-left">Email</th>
            <th className="text-left">Role</th>
            <th className="text-left">Assigned Houses</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <select
                  onChange={(e) => assignHouse(user._id, e.target.value)}
                  className="mr-2 p-1 border rounded"
                >
                  <option value="">Assign House</option>
                  {houses.filter(house => !user.assignedHouses.some(h => h._id === house._id)).map(house => (
                    <option key={house._id} value={house._id}>{house.name}</option>
                  ))}
                </select>
                {user.assignedHouses.map(house => (
                  <span key={house._id} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {house.name}
                    <button onClick={() => removeHouse(user._id, house._id)} className="ml-2 text-red-500">&times;</button>
                  </span>
                ))}
              </td>
              <td>
                <button 
                  onClick={() => deleteUser(user._id)} 
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;