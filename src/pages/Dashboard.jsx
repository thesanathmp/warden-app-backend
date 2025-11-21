import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import authService from "../services/auth";
import apiService from "../services/api";

export default function Dashboard() {
  const meals = ["breakfast", "lunch", "snacks", "dinner"];
  const user = authService.getUser();
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(user?.schoolId || "");
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );

  // Translations
  const translations = {
    en: {
      dashboard: "Warden Dashboard",
      logout: "Logout",
      welcome: "Welcome",
      selectSchool: "Select School for Upload",
      loadingSchools: "Loading schools...",
      selectASchool: "Select a school",
      selected: "Selected",
      schoolId: "School ID",
      todaysMealUploads: "Today's Meal Uploads",
      uploadPhotosFor: "Upload photos for",
      pleaseSelectSchool: "Please select a school before uploading photos",
      pleaseSelectSchoolFirst: "Please select a school first",
      breakfast: "Breakfast",
      lunch: "Lunch",
      snacks: "Snacks",
      dinner: "Dinner",
      language: "Language",
    },
    kn: {
      dashboard: "ವಾರ್ಡನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      logout: "ಲಾಗ್ ಔಟ್",
      welcome: "ಸ್ವಾಗತ",
      selectSchool: "ಅಪ್‌ಲೋಡ್‌ಗಾಗಿ ಶಾಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      loadingSchools: "ಶಾಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      selectASchool: "ಶಾಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      selected: "ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ",
      schoolId: "ಶಾಲೆ ಐಡಿ",
      todaysMealUploads: "ಇಂದಿನ ಊಟದ ಅಪ್‌ಲೋಡ್‌ಗಳು",
      uploadPhotosFor: "ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      pleaseSelectSchool:
        "ದಯವಿಟ್ಟು ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡುವ ಮೊದಲು ಶಾಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      pleaseSelectSchoolFirst: "ದಯವಿಟ್ಟು ಮೊದಲು ಶಾಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      breakfast: "ಬೆಳಗಿನ ಊಟ",
      lunch: "ಮಧ್ಯಾಹ್ನದ ಊಟ",
      snacks: "ತಿಂಡಿ",
      dinner: "ರಾತ್ರಿಯ ಊಟ",
      language: "ಭಾಷೆ",
    },
  };

  const t = translations[language];

  useEffect(() => {
    // Set current date
    const today = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(today.toLocaleDateString("en-US", options));

    const fetchSchools = async () => {
      try {
        setLoading(true);
        const schoolsData = await apiService.getAllSchools();
        setSchools(schoolsData);

        // If user doesn't have a default school, set the first one
        if (!selectedSchool && schoolsData.length > 0) {
          setSelectedSchool(schoolsData[0].licenseNumber);
        }
      } catch (error) {
        console.error("Failed to fetch schools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [selectedSchool]);

  const handleLogout = () => {
    authService.logout();
  };

  const handleSchoolChange = (schoolId) => {
    setSelectedSchool(schoolId);
    // Store selected school in localStorage for persistence
    localStorage.setItem("selectedSchool", schoolId);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);

    // Update date format based on language
    const today = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const locale = newLanguage === "kn" ? "kn-IN" : "en-US";
    setCurrentDate(today.toLocaleDateString(locale, options));
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div
      className="safe-area-top safe-area-bottom"
      style={{
        padding: isMobile ? "16px" : "20px",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          flexDirection: isMobile ? "column" : "row",
          marginBottom: "24px",
          gap: isMobile ? "12px" : "0",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0",
              fontSize: isMobile ? "24px" : "28px",
              fontWeight: "700",
              color: "#1a202c",
            }}
          >
            {t.dashboard}
          </h1>
          {currentDate && (
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: isMobile ? "14px" : "16px",
                color: "#718096",
                fontWeight: "500",
              }}
            >
              📅 {currentDate}
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            alignSelf: isMobile ? "flex-end" : "auto",
          }}
        >
          {/* Language Switch */}
          <div
            style={{
              display: "flex",
              backgroundColor: "#f1f5f9",
              borderRadius: "8px",
              padding: "4px",
              border: "1px solid #e2e8f0",
            }}
          >
            <button
              onClick={() => handleLanguageChange("en")}
              style={{
                padding: "6px 12px",
                backgroundColor: language === "en" ? "#667eea" : "transparent",
                color: language === "en" ? "white" : "#64748b",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageChange("kn")}
              style={{
                padding: "6px 12px",
                backgroundColor: language === "kn" ? "#667eea" : "transparent",
                color: language === "kn" ? "white" : "#64748b",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
            >
              ಕನ್ನಡ
            </button>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: isMobile ? "10px 20px" : "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: isMobile ? "16px" : "14px",
              fontWeight: "500",
            }}
          >
            {t.logout}
          </button>
        </div>
      </div>

      {/* User Info Card */}
      {user && (
        <div
          style={{
            marginBottom: "24px",
            padding: isMobile ? "16px" : "20px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#667eea",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
                fontSize: "18px",
              }}
            >
              👤
            </div>
            <div>
              <p
                style={{
                  margin: "0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1a202c",
                }}
              >
                {t.welcome}, {user.name || user.role}
              </p>
              <p style={{ margin: "0", fontSize: "14px", color: "#718096" }}>
                {user.role.replace("_", " ").toUpperCase()}
              </p>
            </div>
          </div>

          {/* School Selection */}
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              🏫 {t.selectSchool}
            </label>
            <select
              value={selectedSchool}
              onChange={(e) => handleSchoolChange(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "white",
                color: "#1a202c",
                cursor: loading ? "not-allowed" : "pointer",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
              }}
            >
              {loading ? (
                <option>{t.loadingSchools}</option>
              ) : (
                <>
                  <option value="">{t.selectASchool}</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school.licenseNumber}>
                      {school.name} ({school.licenseNumber})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>          
        </div>
      )}

      {/* Meal Upload Section */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: isMobile ? "20px" : "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              margin: "0",
              fontSize: isMobile ? "20px" : "24px",
              fontWeight: "600",
              color: "#1a202c",
            }}
          >
            📸 {t.todaysMealUploads}
          </h2>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "14px",
              color: "#718096",
            }}
          >
            {t.uploadPhotosFor} {currentDate}
          </p>
        </div>

        {/* School Selection Warning */}
        {!selectedSchool && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#fef3c7",
              borderRadius: "8px",
              border: "1px solid #fde68a",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "20px", marginRight: "8px" }}>⚠️</span>
              <p
                style={{
                  margin: "0",
                  fontSize: "14px",
                  color: "#92400e",
                  fontWeight: "500",
                }}
              >
                {t.pleaseSelectSchool}
              </p>
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fit, minmax(200px, 1fr))",
            gap: isMobile ? "12px" : "16px",
          }}
        >
          {meals.map((meal) => (
            <Link
              key={meal}
              to={
                selectedSchool
                  ? `/upload?meal=${meal}&school=${selectedSchool}`
                  : "#"
              }
              onClick={(e) => {
                if (!selectedSchool) {
                  e.preventDefault();
                  alert(t.pleaseSelectSchoolFirst);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isMobile ? "flex-start" : "center",
                padding: isMobile ? "16px" : "24px",
                backgroundColor: selectedSchool ? "#667eea" : "#e5e7eb",
                color: selectedSchool ? "white" : "#9ca3af",
                textDecoration: "none",
                borderRadius: "12px",
                textTransform: "capitalize",
                fontWeight: "600",
                fontSize: isMobile ? "16px" : "18px",
                transition: "all 0.2s ease",
                boxShadow: selectedSchool
                  ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                  : "none",
                cursor: selectedSchool ? "pointer" : "not-allowed",
                opacity: selectedSchool ? 1 : 0.6,
              }}
              onMouseEnter={(e) => {
                if (selectedSchool) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 6px 20px rgba(102, 126, 234, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedSchool) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(102, 126, 234, 0.3)";
                }
              }}
            >
              <span
                style={{
                  marginRight: isMobile ? "12px" : "8px",
                  fontSize: "20px",
                }}
              >
                {meal === "breakfast"
                  ? "🍳"
                  : meal === "lunch"
                  ? "🍽️"
                  : meal === "snacks"
                  ? "🍪"
                  : "🍛"}
              </span>
              {t[meal]}
              {isMobile && (
                <span style={{ marginLeft: "auto", fontSize: "16px" }}>
                  {selectedSchool ? "→" : "🔒"}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
