import React, { useState, useEffect, useRef } from 'react';
// import CollegeNavbar from '../../components/CollegeNavbar';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { FaEllipsisV } from 'react-icons/fa';
import data from '../../components/Database.json'; // Adjust the path as necessary

const CollegePassword = () => {
  const [students, setStudents] = useState([]);
  const [clubHeads, setClubHeads] = useState([]);
  const [editingPasswordId, setEditingPasswordId] = useState(null);
  const [passwords, setPasswords] = useState({});
  const [showPassword, setShowPassword] = useState({});
  const [section, setSection] = useState('students'); // 'students', 'clubHeads', or 'blocked'
  const [filters, setFilters] = useState({ rollNo: '', year: '', branch: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showMenuId, setShowMenuId] = useState(null);
  const [blockedIds, setBlockedIds] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (data && typeof data === 'object') {
        const studentsData = data.students || [];
        const clubHeadsData = data.clubHeads || [];

        setStudents(studentsData);
        setClubHeads(clubHeadsData);
      } else {
        console.error('Invalid data format');
      }
    };

    fetchProfiles();

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenuId(null); // Close the menu if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePasswordChange = (e, id) => {
    const { value } = e.target;
    setPasswords((prevState) => ({ ...prevState, [id]: value }));
  };

  const handlePasswordVisibility = (id) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handleEditPassword = (id) => {
    setEditingPasswordId(id);
    setShowMenuId(null); // Close menu on edit
  };

  const handleSavePassword = (id) => {
    console.log(`Password for user with id ${id} has been updated to: ${passwords[id]}`);
    // Update the student's password in the data
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === id ? { ...student, password: passwords[id] } : student
      )
    );
    setEditingPasswordId(null); // Close password edit form
    setPasswords((prev) => ({ ...prev, [id]: '' })); // Reset password field
  };

  const handleToggleSection = (section) => {
    setSection(section);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleMenuClick = (id) => {
    setShowMenuId(showMenuId === id ? null : id); // Toggle menu for the specific user
  };

  const handleViewProfile = (user) => {
    setSelectedStudent(user);
    setShowMenuId(null); // Close menu
  };

  const handleBlockUnblock = (id) => {
    setBlockedIds((prev) =>
      prev.includes(id) ? prev.filter((blockedId) => blockedId !== id) : [...prev, id]
    );
    setShowMenuId(null); // Close menu on block/unblock
  };

  const filteredStudents = students.filter((student) => {
    return (
      (!filters.rollNo || student.rollNo.includes(filters.rollNo)) &&
      (!filters.year || student.year === filters.year) &&
      (!filters.branch || student.branch === filters.branch) &&
      !blockedIds.includes(student.id)
    );
  });

  const blockedStudents = students.filter((student) => blockedIds.includes(student.id));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* <CollegeNavbar /> */}
      <div className="container mx-auto py-10 px-5">
        <h1 className="text-4xl font-bold mb-10 text-center text-gray-100">College Administration Panel</h1>

        {/* Section Toggle (Slider) */}
        <div className="flex justify-center items-center mb-10 space-x-2">
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              section === 'students' ? 'bg-gray-700 text-gray-100' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            onClick={() => handleToggleSection('students')}
          >
            Students
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              section === 'clubHeads' ? 'bg-gray-700 text-gray-100' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            onClick={() => handleToggleSection('clubHeads')}
          >
            Club Heads
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              section === 'blocked' ? 'bg-gray-700 text-gray-100' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            onClick={() => handleToggleSection('blocked')}
          >
            Blocked Students
          </button>
        </div>

        {/* Filters for Students Section */}
        {section === 'students' && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="rollNo"
              value={filters.rollNo}
              onChange={handleFilterChange}
              placeholder="Filter by Roll No"
              className="p-3 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <input
              type="text"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              placeholder="Filter by Year"
              className="p-3 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <input
              type="text"
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
              placeholder="Filter by Branch"
              className="p-3 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        )}

        {/* Profile View */}
        {selectedStudent && (
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg mb-6 relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedStudent.name}'s Profile</h2>
            <p>
              <strong>Roll No:</strong> {selectedStudent.rollNo}
            </p>
            <p>
              <strong>Year:</strong> {selectedStudent.year}
            </p>
            <p>
              <strong>Branch:</strong> {selectedStudent.branch}
            </p>
            <p>
              <strong>Current Password:</strong> {selectedStudent.password}
            </p>
            <p>
              <strong>Details:</strong> {selectedStudent.details}
            </p>
          </div>
        )}

        {/* Blocked Students Section */}
        {section === 'blocked' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Blocked Students</h2>
            {blockedStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blockedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg relative"
                  >
                    <p className="text-lg font-semibold mb-2">{student.name}</p>
                    <p className="text-sm text-gray-500 mb-4">Roll No: {student.rollNo}</p>
                    <button
                      onClick={() => handleBlockUnblock(student.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No blocked students.</p>
            )}
          </div>
        )}

        {/* Students Section */}
        {(section === 'students' || section === 'clubHeads') && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{section === 'students' ? 'Students' : 'Club Heads'}</h2>
            {section === 'students' ? (
              filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg relative"
                    >
                      <p className="text-lg font-semibold mb-2">{student.name}</p>
                      <p className="text-sm text-gray-500 mb-4">Roll No: {student.rollNo}</p>
                      <button
                        onClick={() => handleMenuClick(student.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                      >
                        <FaEllipsisV />
                      </button>
                      {showMenuId === student.id && (
                        <div
                          ref={menuRef}
                          className="absolute top-10 right-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg shadow-lg p-2 z-50"
                        >
                          <button
                            onClick={() => handleViewProfile(student)}
                            className="block px-4 py-2 hover:bg-gray-600 rounded-lg"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleEditPassword(student.id)}
                            className="block px-4 py-2 hover:bg-gray-600 rounded-lg"
                          >
                            Edit Password
                          </button>
                          <button
                            onClick={() => handleBlockUnblock(student.id)}
                            className="block px-4 py-2 hover:bg-gray-600 rounded-lg"
                          >
                            {blockedIds.includes(student.id) ? 'Unblock' : 'Block'}
                          </button>
                        </div>
                      )}
                      {editingPasswordId === student.id && (
                        <div className="mt-4">
                          <input
                            type={showPassword[student.id] ? 'text' : 'password'}
                            value={passwords[student.id] || ''}
                            onChange={(e) => handlePasswordChange(e, student.id)}
                            placeholder="New Password"
                            className="p-2 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                          />
                          <button
                            onClick={() => handlePasswordVisibility(student.id)}
                            className="ml-2 text-gray-400 hover:text-gray-200"
                          >
                            {showPassword[student.id] ? <AiFillEyeInvisible /> : <AiFillEye />}
                          </button>
                          <button
                            onClick={() => handleSavePassword(student.id)}
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No students found.</p>
              )
            ) : (
              clubHeads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clubHeads.map((clubHead) => (
                    <div
                      key={clubHead.id}
                      className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg relative"
                    >
                      <p className="text-lg font-semibold mb-2">{clubHead.name}</p>
                      <p className="text-sm text-gray-500 mb-4">Roll No: {clubHead.rollNo}</p>
                      <button
                        onClick={() => handleMenuClick(clubHead.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                      >
                        <FaEllipsisV />
                      </button>
                      {showMenuId === clubHead.id && (
                        <div
                          ref={menuRef}
                          className="absolute top-10 right-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg shadow-lg p-2 z-50"
                        >
                          <button
                            onClick={() => handleViewProfile(clubHead)}
                            className="block px-4 py-2 hover:bg-gray-600 rounded-lg"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleEditPassword(clubHead.id)}
                            className="block px-4 py-2 hover:bg-gray-600 rounded-lg"
                          >
                            Edit Password
                          </button>
                          <button
                            onClick={() => handleBlockUnblock(clubHead.id)}
                            className="block px-4 py-2 hover:bg-gray-600 rounded-lg"
                          >
                            {blockedIds.includes(clubHead.id) ? 'Unblock' : 'Block'}
                          </button>
                        </div>
                      )}
                      {editingPasswordId === clubHead.id && (
                        <div className="mt-4">
                          <input
                            type={showPassword[clubHead.id] ? 'text' : 'password'}
                            value={passwords[clubHead.id] || ''}
                            onChange={(e) => handlePasswordChange(e, clubHead.id)}
                            placeholder="New Password"
                            className="p-2 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                          />
                          <button
                            onClick={() => handlePasswordVisibility(clubHead.id)}
                            className="ml-2 text-gray-400 hover:text-gray-200"
                          >
                            {showPassword[clubHead.id] ? <AiFillEyeInvisible /> : <AiFillEye />}
                          </button>
                          <button
                            onClick={() => handleSavePassword(clubHead.id)}
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No club heads found.</p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegePassword;
