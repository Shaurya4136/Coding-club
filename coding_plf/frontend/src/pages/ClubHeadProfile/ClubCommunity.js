// src/pages/ClubCommunity.js

import React from 'react';
import Community from '../../components/Community';
// import ClubNavbar from '../../components/ClubHeadNavbar';
import CommunityData from '../../components/CommunityData.json'

const ClubCommunity = () => (
  <Community data={CommunityData}  />
);

export default ClubCommunity;
