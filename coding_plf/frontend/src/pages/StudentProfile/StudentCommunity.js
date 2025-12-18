// src/pages/StudentCommunity.js
import React from 'react';
import Community from '../../components/Community';
import studentCommunityData from '../../components/CommunityData.json';

const StudentCommunity = () => {
  return (
    <div>
      
      {/* Render the Community component with data */}
      <Community data={studentCommunityData} />
    </div>
  );
}

export default StudentCommunity;
