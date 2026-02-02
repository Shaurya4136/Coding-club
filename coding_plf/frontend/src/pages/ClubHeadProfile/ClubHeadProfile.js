import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
// import ClubHeadNavbar from '../../components/ClubHeadNavbar';
import { FaEdit, FaSignOutAlt, FaKey, FaEnvelope, FaLink, FaUsers,FaUserMinus,FaPlus, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://coding-club-1.onrender.com';
const PROFILE_URL = process.env.NEXT_PUBLIC_CLUBHEAD_PROFILE_ENDPOINT || `${API_BASE_URL}/api/profile`;

const DEFAULT_PROFILE = {
  name: 'New Club Head',
  email: '',
  bio: '',
  avatar: '/default-avatar.png',
  joinedDate: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
  clubName: '',
  position: 'Head',
  responsibilities: [],
  eventsManaged: [],
  teamMembers: [],
  phone: '',
  linkedin: '',
  github: '',
  instagram: '',
  education: { college: '', degree: '', year: '' },
};

const LOCAL_KEY = 'clubHeadProfile';
const MAX_AVATAR_SIZE_MB = 2;

const ClubHeadProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE);
  const [editProfileData, setEditProfileData] = useState(DEFAULT_PROFILE);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [saving, setSaving] = useState(false);

  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [newEmail, setNewEmail] = useState('');

  const safeNormalize = (data) => ({
    ...DEFAULT_PROFILE,
    ...(data || {}),
    responsibilities: Array.isArray(data?.responsibilities) ? data.responsibilities : [],
    eventsManaged: Array.isArray(data?.eventsManaged) ? data.eventsManaged : [],
    teamMembers: Array.isArray(data?.teamMembers) ? data.teamMembers : [],
    avatar: data?.avatar || DEFAULT_PROFILE.avatar,
    joinedDate: data?.joinedDate || DEFAULT_PROFILE.joinedDate,
    education: { ...DEFAULT_PROFILE.education, ...(data?.education || {}) },
  });

  const readLocal = () => {
    try { const raw = localStorage.getItem(LOCAL_KEY); return raw ? safeNormalize(JSON.parse(raw)) : null; } 
    catch { return null; }
  };

  const writeLocal = (data) => { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(safeNormalize(data))); } catch {} };

  const getToken = () => localStorage.getItem('token');
  const authHeaders = () => {
    const token = getToken();
    return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
  };

  const loadProfile = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(PROFILE_URL, { credentials: 'include', headers: authHeaders() });
      let data;
      if (res.ok) data = await res.json();
      else if (res.status === 404) {
        const createRes = await fetch(PROFILE_URL, { method: 'POST', headers: authHeaders(), credentials: 'include', body: JSON.stringify(DEFAULT_PROFILE) });
        data = createRes.ok ? await createRes.json() : DEFAULT_PROFILE;
      } else throw new Error(`Failed to load profile (${res.status})`);
      const normalized = safeNormalize(data);
      setProfileData(normalized);
      setEditProfileData(normalized);
      writeLocal(normalized);
    } catch (e) {
      console.error('Profile load error:', e);
      const local = readLocal();
      if (local) setProfileData(local);
      else writeLocal(DEFAULT_PROFILE);
      setError('Working offline – changes will be saved locally.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleInputChange = (e) => { const { name, value } = e.target; setEditProfileData((prev) => ({ ...prev, [name]: value })); };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size / 1024 / 1024 > MAX_AVATAR_SIZE_MB) { alert(`Image size should be less than ${MAX_AVATAR_SIZE_MB}MB`); return; }
    const reader = new FileReader();
    reader.onloadend = () => setEditProfileData((prev) => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleArrayChange = (arrayName, index, value) => {
    const updated = [...editProfileData[arrayName]];
    updated[index] = value;
    setEditProfileData({ ...editProfileData, [arrayName]: updated });
  };

  const addArrayItem = (arrayName) => setEditProfileData({ ...editProfileData, [arrayName]: [...editProfileData[arrayName], ''] });
  const removeArrayItem = (arrayName, index) => setEditProfileData({ ...editProfileData, [arrayName]: editProfileData[arrayName].filter((_, i) => i !== index) });

  const saveProfile = async () => {
    setSaving(true); setError('');
    const prevData = profileData;
    const nextData = safeNormalize(editProfileData);
    setProfileData(nextData); writeLocal(nextData);
    try {
      const res = await fetch(PROFILE_URL, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(nextData) });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const saved = safeNormalize(await res.json().catch(() => nextData));
      setProfileData(saved); writeLocal(saved);
      setShowEditPopup(false); alert('✅ Profile updated successfully!');
    } catch (e) { console.error('Save error:', e); setProfileData(prevData); setError('Could not save to server. Changes are kept locally.'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem(LOCAL_KEY); navigate('/login'); };

  const handleChangePassword = async () => {
    setError('');
    try {
      const res = await fetch(`${PROFILE_URL}/change-password`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(passwordData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');
      alert('✅ Password updated successfully!'); setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (err) { console.error('Password change error:', err); setError(err.message); }
  };

  const handleChangeEmail = async () => {
    setError('');
    try {
      const res = await fetch(`${PROFILE_URL}/change-email`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ newEmail }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change email');
      alert('✅ Email updated successfully!');
      setProfileData((prev) => ({ ...prev, email: data.email })); setNewEmail('');
    } catch (err) { console.error('Email change error:', err); setError(err.message); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('⚠️ Are you sure you want to delete your account? This cannot be undone.')) return;
    setError('');
    try {
      const res = await fetch(PROFILE_URL, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete account');
      alert('❌ Account deleted successfully'); handleLogout();
    } catch (err) { console.error('Delete account error:', err); setError(err.message); }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* <ClubHeadNavbar /> */}
      {loading ? (
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-xl font-semibold animate-pulse">Loading profile...</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-700 to-purple-700 shadow-xl rounded-xl p-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex items-center space-x-6 flex-1">
              <img src={profileData.avatar || '/default-avatar.png'} alt="avatar" className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"/>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold truncate">{profileData.name}</h1>
                <p className="text-gray-200 truncate">{profileData.email}</p>
                <p className="mt-1 text-gray-300 text-sm">Joined: {profileData.joinedDate}</p>
                <p className="mt-1 text-gray-300 text-sm">Club: {profileData.clubName || 'Not set'} | Position: {profileData.position}</p>
              </div>
            </div>
            <div className="flex space-x-3 flex-wrap">
              <button onClick={() => setShowEditPopup(true)} className="flex items-center bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md">
                <FaEdit className="mr-2"/> Edit
              </button>
              <button onClick={handleLogout} className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md">
                <FaSignOutAlt className="mr-2"/> Logout
              </button>
            </div>
          </div>

          {/* Edit Popup */}
          {showEditPopup && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start pt-6 z-50 overflow-auto"
            >
              <motion.div
                initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                className="bg-gray-800 rounded-xl w-full max-w-3xl p-6 space-y-4 shadow-2xl overflow-auto max-h-[90vh]"
              >

                <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Edit Profile</h2>

                {/* Avatar */}
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  <img src={editProfileData.avatar || '/default-avatar.png'} alt="avatar" className="w-24 h-24 rounded-full border-2 border-white object-cover"/>
                  <input type="file" onChange={handleAvatarChange} className="text-sm"/>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="name" value={editProfileData.name} onChange={handleInputChange} placeholder="Name" className="w-full p-2 rounded bg-gray-700"/>
                  <input name="bio" value={editProfileData.bio} onChange={handleInputChange} placeholder="Bio" className="w-full p-2 rounded bg-gray-700"/>
                  <input name="clubName" value={editProfileData.clubName} onChange={handleInputChange} placeholder="Club Name" className="w-full p-2 rounded bg-gray-700"/>
                  <input name="position" value={editProfileData.position} onChange={handleInputChange} placeholder="Position" className="w-full p-2 rounded bg-gray-700"/>
                  <input name="phone" value={editProfileData.phone} onChange={handleInputChange} placeholder="Phone" className="w-full p-2 rounded bg-gray-700"/>
                  <input name="linkedin" value={editProfileData.linkedin} onChange={handleInputChange} placeholder="LinkedIn" className="w-full p-2 rounded bg-gray-700"/>
                  <input name="github" value={editProfileData.github} onChange={handleInputChange} placeholder="GitHub" className="w-full p-2 rounded bg-gray-700"/>
                  <input name="instagram" value={editProfileData.instagram} onChange={handleInputChange} placeholder="Instagram" className="w-full p-2 rounded bg-gray-700"/>
                </div>

                {/* Arrays: Responsibilities, Events, Team Members */}
                {['responsibilities', 'eventsManaged', 'teamMembers'].map((arr) => (
                  <div key={arr} className="mt-2">
                    <h3 className="text-xl font-semibold capitalize">{arr.replace(/([A-Z])/g, ' $1')}</h3>
                    <div className="space-y-2">
                      {editProfileData[arr].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input value={item} onChange={(e)=>handleArrayChange(arr, idx, e.target.value)} className="p-2 rounded bg-gray-700 flex-1"/>
                          <button onClick={()=>removeArrayItem(arr, idx)} className="bg-red-600 px-2 py-1 rounded"><FaTrash/></button>
                        </div>
                      ))}
                      <button onClick={()=>addArrayItem(arr)} className="flex items-center bg-green-600 px-3 py-1 rounded mt-2"><FaPlus className="mr-1"/> Add</button>
                    </div>
                  </div>
                ))}

                {/* Education */}
                <h3 className="text-xl font-semibold mt-2">Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input name="college" value={editProfileData.education.college} onChange={(e)=>setEditProfileData({...editProfileData, education:{...editProfileData.education, college:e.target.value}})} placeholder="College" className="w-full p-2 rounded bg-gray-700"/>
                  <input name="degree" value={editProfileData.education.degree} onChange={(e)=>setEditProfileData({...editProfileData, education:{...editProfileData.education, degree:e.target.value}})} placeholder="Degree" className="w-full p-2 rounded bg-gray-700"/>
                  <input name="year" value={editProfileData.education.year} onChange={(e)=>setEditProfileData({...editProfileData, education:{...editProfileData.education, year:e.target.value}})} placeholder="Year" className="w-full p-2 rounded bg-gray-700"/>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row justify-end gap-3 mt-4">
                  <button onClick={()=>setShowEditPopup(false)} className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                  <button onClick={saveProfile} className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700">{saving ? 'Saving...' : 'Save'}</button>
                </div>

              </motion.div>
            </motion.div>
          )}

          {/* Bio Section */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-2">Bio</h2>
            <p className="text-gray-300">{profileData.bio || 'No bio available.'}</p>
          </div>

          {/* Responsibilities */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-2">Responsibilities</h2>
            {profileData.responsibilities.length ? (
              <ul className="list-disc pl-6">
                {profileData.responsibilities.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            ) : <p className="text-gray-400">No responsibilities added yet.</p>}
          </div>

          {/* Events Managed */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-2">Events Managed</h2>
            {profileData.eventsManaged.length ? (
              <ul className="list-disc pl-6">
                {profileData.eventsManaged.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            ) : <p className="text-gray-400">No events added yet.</p>}
          </div>

          {/* Team Members */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-2">Team Members</h2>
            {profileData.teamMembers.length ? (
              <ul className="list-disc pl-6">
                {profileData.teamMembers.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            ) : <p className="text-gray-400">No team members added yet.</p>}
          </div>

          {/* Education & Social */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-2">Education</h2>
            <p>{profileData.education.college || 'College not added'}</p>
            <p>{profileData.education.degree || 'Degree not added'} - {profileData.education.year || 'Year not set'}</p>
            <p>Phone: {profileData.phone || 'Not added'}</p>
            <p>LinkedIn: {profileData.linkedin || 'Not added'}</p>
            <p>GitHub: {profileData.github || 'Not added'}</p>
            <p>Instagram: {profileData.instagram || 'Not added'}</p>
          </div>

          {/* Password & Email */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-2"><FaKey className="mr-2"/> Change Password</h2>
            <input type="password" placeholder="Old Password" className="w-full mb-2 p-2 bg-gray-700 rounded" value={passwordData.oldPassword} onChange={(e)=>setPasswordData({...passwordData,oldPassword:e.target.value})}/>
            <input type="password" placeholder="New Password" className="w-full mb-2 p-2 bg-gray-700 rounded" value={passwordData.newPassword} onChange={(e)=>setPasswordData({...passwordData,newPassword:e.target.value})}/>
            <button onClick={handleChangePassword} className="bg-indigo-600 px-4 py-2 rounded">Update Password</button>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-2"><FaEnvelope className="mr-2"/> Change Email</h2>
            <input type="email" placeholder="New Email" className="w-full mb-2 p-2 bg-gray-700 rounded" value={newEmail} onChange={(e)=>setNewEmail(e.target.value)}/>
            <button onClick={handleChangeEmail} className="bg-indigo-600 px-4 py-2 rounded">Update Email</button>
          </div>

          {/* Delete Account */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-2 text-red-400"><FaUserMinus className="mr-2"/> Delete Account</h2>
            <button onClick={handleDeleteAccount} className="bg-red-600 px-4 py-2 rounded">Delete My Account</button>
          </div>

          {error && <div className="text-red-500 text-center font-medium">{error}</div>}

        </div>
      )}
    </div>
  );
};

export default ClubHeadProfile;
