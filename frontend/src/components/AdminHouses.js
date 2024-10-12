import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminHouses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingHouse, setEditingHouse] = useState(null);

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/houses');
      setHouses(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching houses:', error);
      setError('Failed to fetch houses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const deleteHouse = async (id) => {
    if (window.confirm('Are you sure you want to delete this house? This action cannot be undone.')) {
      try {
        await api.delete(`/houses/${id}`);
        setHouses(houses.filter(house => house._id !== id));
      } catch (error) {
        console.error('Error deleting house:', error);
        setError('Failed to delete house. Please try again.');
      }
    }
  };

  const startEditing = (house) => {
    setEditingHouse({ ...house });
  };

  const handleEditChange = (e) => {
    setEditingHouse({ ...editingHouse, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    try {
      const response = await api.put(`/houses/${editingHouse._id}`, editingHouse);
      setHouses(houses.map(house => house._id === editingHouse._id ? response.data : house));
      setEditingHouse(null);
    } catch (error) {
      console.error('Error updating house:', error);
      setError('Failed to update house. Please try again.');
    }
  };

  if (loading) return <div>Loading houses...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Houses</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Name</th>
            <th className="text-left">Description</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {houses.map((house) => (
            <tr key={house._id}>
              <td>
                {editingHouse && editingHouse._id === house._id ? (
                  <input
                    type="text"
                    name="name"
                    value={editingHouse.name}
                    onChange={handleEditChange}
                    className="w-full p-1 border rounded"
                  />
                ) : (
                  house.name
                )}
              </td>
              <td>
                {editingHouse && editingHouse._id === house._id ? (
                  <textarea
                    name="description"
                    value={editingHouse.description}
                    onChange={handleEditChange}
                    className="w-full p-1 border rounded"
                  />
                ) : (
                  house.description
                )}
              </td>
              <td>
                {editingHouse && editingHouse._id === house._id ? (
                  <>
                    <button onClick={saveEdit} className="mr-2 text-green-500">Save</button>
                    <button onClick={() => setEditingHouse(null)} className="text-gray-500">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(house)} className="mr-2 text-blue-500">Edit</button>
                    <button onClick={() => deleteHouse(house._id)} className="text-red-500">Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminHouses;