import React from 'react'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";

const UserProfile = () => {
  const { userId } = useParams();
  console.log(userId);

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  if (!userData) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>User Profile</h1>
      <p>User ID: {userId}</p>
      <p>Name: {userData.name}</p>
      <p>Email: {userData.email}</p>
      <p>Phone: {userData.phone}</p>
      <p>Website: {userData.website}</p>
    </div>
  )
}

export default UserProfile
