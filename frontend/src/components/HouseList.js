import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext'; // Make sure this path is correct

const HouseList = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/houses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHouses(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching houses:', error);
      setError('Failed to fetch houses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading houses...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">
        {user.role === 'admin' ? 'All Houses' : 'Your Assigned Houses'}
      </h2>

      {houses.length === 0 ? (
        <p>No houses available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {houses.map((house) => (
            <Link to={`/houses/${house._id}`} key={house._id} className="border p-4 rounded shadow hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold">{house.name}</h3>
              <p>{house.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HouseList;