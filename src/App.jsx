import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getQueuedItems, clearQueue } from "./services/offlineQueue";
import apiService from "./services/api";
import authService from "./services/auth";

// Import pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UploadPhotos from "./pages/UploadPhotos";
import PhotoGallery from "./components/PhotoGallery";
import InstallPWA from "./components/InstallPWA";

// Protected Route component
function ProtectedRoute({ children }) {
  return authService.isAuthenticated() ? children : <Navigate to="/" />;
}

function App() {
  useEffect(() => {
    const sync = async () => {
      if (!navigator.onLine) return;

      const items = await getQueuedItems();
      if (!items.length) return;

      for (let item of items) {
        const form = new FormData();
        form.append("photo", item.photo);
        form.append("mealType", item.mealType);
        if (item.schoolId) {
          form.append("schoolId", item.schoolId);
        }

        try {
          await apiService.uploadPhoto(form);
        } catch (err) {
          console.log("Still offline");
        }
      }

      await clearQueue();
    };

    window.addEventListener("online", sync);

    return () => window.removeEventListener("online", sync);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <UploadPhotos />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/gallery" 
          element={
            <ProtectedRoute>
              <PhotoGallery schoolId={localStorage.getItem('selectedSchool')} />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <InstallPWA />
    </Router>
  );
}

export default App;
