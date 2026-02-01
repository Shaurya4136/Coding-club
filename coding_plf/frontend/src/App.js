import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

/* =======================
   Pages
======================= */
import HomePage from "./pages/HomePage";
import OptPageSignin from "./pages/OptpageSignin";
import LoginRegisterPageCollege from "./pages/LoginRegisterpageCollege";
import LoginRegisterPageStudent from "./pages/LoginRegisterpageStudent";
import LoginRegisterPageClub from "./pages/LoginRegisterpageClub";

import StudentCommunity from "./pages/StudentProfile/StudentCommunity";
import StudentProfile from "./pages/StudentProfile/StudentProfile";
import StudentQuestions from "./pages/StudentProfile/StudentsQuestion";

import ClubCommunity from "./pages/ClubHeadProfile/ClubCommunity";
import ClubProfile from "./pages/ClubHeadProfile/ClubHeadProfile";
import ClubPostPage from "./pages/ClubHeadProfile/ClubPost";
import ClubTeamManagement from "./pages/ClubHeadProfile/TeamManagement";

import CollegeCommunity from "./pages/CollegeProfile/CollegeCommunite";
import CollegeProfile from "./pages/CollegeProfile/CollegeProfile";
import CollegePostPage from "./pages/CollegeProfile/CollegePost";
import CollegePassword from "./pages/CollegeProfile/Collegepassword";
// import HomePageManager from "./pages/CollegeProfile/HomePageCMS";
import CollegeAdminConsole from "./pages/CollegeProfile/CollegeDashboard";
import AboutUs from "./pages/AboutUs";
/* =======================
   Layout & Utils
======================= */
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

/* =======================
   Global Loader
======================= */
import FullScreenLoader from "./components/FullScreenLoader";

const App = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  /* 🔁 Loader on route change */
  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [location]);

  // ⛔ DO NOT render routes while loading
  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <Routes>
      {/* =======================
         Public Routes
      ======================== */}
      <Route path="/" element={<HomePage />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route path="/Login" element={<OptPageSignin />} />
      <Route path="/SignUp" element={<OptPageSignin />} />


      <Route path="/CollegeLoginRegister" element={<LoginRegisterPageCollege />} />
      <Route path="/StudentLoginRegister" element={<LoginRegisterPageStudent />} />
      <Route path="/ClubHeadLoginRegister" element={<LoginRegisterPageClub />} />

      {/* =======================
         Student Routes
      ======================== */}
      <Route
        path="/student-community"
        element={
          <ProtectedRoute>
            <AppLayout role="student">
              <StudentCommunity />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-profile"
        element={
          <ProtectedRoute>
            <AppLayout role="student">
              <StudentProfile />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-questions"
        element={
          <ProtectedRoute>
            <AppLayout role="student">
              <StudentQuestions />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* =======================
         Club Routes
      ======================== */}
      <Route
        path="/club-community"
        element={
          <ProtectedRoute>
            <AppLayout role="club">
              <ClubCommunity />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/club-profile"
        element={
          <ProtectedRoute>
            <AppLayout role="club">
              <ClubProfile />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/club-posts"
        element={
          <ProtectedRoute>
            <AppLayout role="club">
              <ClubPostPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/club-team"
        element={
          <ProtectedRoute>
            <AppLayout role="club">
              <ClubTeamManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* =======================
         College Routes
      ======================== */}
      <Route
        path="/college-community"
        element={
          <ProtectedRoute>
            <AppLayout role="college">
              <CollegeCommunity />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/college-dashboard"
        element={
          <ProtectedRoute>
            <AppLayout role="college">
              <CollegeAdminConsole />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/college-profile"
        element={
          <ProtectedRoute>
            <AppLayout role="college">
              <CollegeProfile />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/college-post"
        element={
          <ProtectedRoute>
            <AppLayout role="college">
              <CollegePostPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* <Route
        path="/college-homepage"
        element={
          <ProtectedRoute>
            <AppLayout role="college">
              <HomePageManager />
            </AppLayout>
          </ProtectedRoute>
        }
      /> */}

      <Route
        path="/college-password"
        element={
          <ProtectedRoute>
            <AppLayout role="college">
              <CollegePassword />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* =======================
         Fallback
      ======================== */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};

export default App;
