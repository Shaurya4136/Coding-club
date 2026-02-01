import {
  FaUsers,
  FaClipboardList,
  FaUserTie,
  FaUser,
  FaHome,
  FaCalendarAlt,
  FaBullhorn,
  FaChartLine,
} from "react-icons/fa";

export const sidebarConfig = {
  student: [
    { label: "Community", path: "/student-community", icon: FaUsers },
    { label: "My Questions", path: "/student-questions", icon: FaClipboardList },
    { label: "Profile", path: "/student-profile", icon: FaUser },
  ],

  club: [
    // { label: "Dashboard", path: "/club-dashboard", icon: FaChartLine },
    { label: "Community", path: "/club-community", icon: FaUsers },
    { label: "Club Posts", path: "/club-posts", icon: FaBullhorn },

    // 🔥 NEW OPTIONS FOR CLUB HEAD
    // { label: "All Members", path: "/club-members", icon: FaUserTie },
    { label: "Team Management", path: "/club-team", icon: FaUsers },
    // { label: "Events", path: "/club-events", icon: FaCalendarAlt },

    { label: "Profile", path: "/club-profile", icon: FaUser },
  ],

  college: [
    { label: "Dashboard", path: "/college-dashboard", icon: FaChartLine },
    { label: "Community", path: "/college-community", icon: FaUsers },
    { label: "Password Management", path: "/college-password", icon: FaClipboardList },
    { label: "Profile", path: "/college-profile", icon: FaUser },
    {
  label: "Home Page",
  path: "/college-homepage",
  icon: FaHome
},
  ],
};
