import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import apiService from "../services/api";
import { saveToQueue } from "../services/offlineQueue";

export default function UploadPhoto() {
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );
  const [params] = useSearchParams();
  const mealType = params.get("meal") || "breakfast";
  const schoolId =
    params.get("school") || localStorage.getItem("selectedSchool") || "";

  // Helper function to convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Translations
  const translations = {
    en: {
      upload: "Upload",
      photo: "Photo",
      mealType: "Meal Type",
      schoolId: "School ID",
      notSelected: "Not Selected",
      noSchoolSelected: "No School Selected",
      goBackToSelectSchool:
        "Please go back to dashboard and select a school first",
      takeOrSelectPhoto: "Take or Select Photo",
      photosSelected: "Photo(s) Selected!",
      tapToSelectPhotos: "Tap to select multiple photos",
      selectMorePhotos: "Select more photos to add them to your upload",
      photosPreview: "Photos Preview",
      clearAll: "Clear All",
      totalSize: "Total Size",
      submit: "Submit",
      uploading: "Uploading...",
      pleaseSelectPhoto: "Please select at least one photo",
      uploadingPhotos: "Uploading {count} photo(s)...",
      uploadingPhoto: "Uploading photo {current} of {total}...",
      allPhotosUploaded: "All {count} photos uploaded successfully!",
      somePhotosUploaded: "{success} photos uploaded, {failed} saved offline",
      allPhotosSavedOffline: "All photos saved offline for later upload",
      uploadFailed: "Upload failed",
      fullSizePhoto: "Full size photo",
      tapOutsideToClose: "Tap outside to close",
      breakfast: "Breakfast",
      lunch: "Lunch",
      snacks: "Snacks",
      dinner: "Dinner",
    },
    kn: {
      upload: "ಅಪ್‌ಲೋಡ್",
      photo: "ಫೋಟೋ",
      mealType: "ಊಟದ ಪ್ರಕಾರ",
      schoolId: "ಶಾಲೆ ಐಡಿ",
      notSelected: "ಆಯ್ಕೆಮಾಡಲಾಗಿಲ್ಲ",
      noSchoolSelected: "ಯಾವುದೇ ಶಾಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಲಾಗಿಲ್ಲ",
      goBackToSelectSchool:
        "ದಯವಿಟ್ಟು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ ಮತ್ತು ಮೊದಲು ಶಾಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      takeOrSelectPhoto: "ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಆಯ್ಕೆಮಾಡಿ",
      photosSelected: "ಫೋಟೋ(ಗಳು) ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ!",
      tapToSelectPhotos: "ಅನೇಕ ಫೋಟೋಗಳನ್ನು ಆಯ್ಕೆಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
      selectMorePhotos:
        "ನಿಮ್ಮ ಅಪ್‌ಲೋಡ್‌ಗೆ ಸೇರಿಸಲು ಹೆಚ್ಚಿನ ಫೋಟೋಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      photosPreview: "ಫೋಟೋಗಳ ಪೂರ್ವವೀಕ್ಷಣೆ",
      clearAll: "ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ",
      totalSize: "ಒಟ್ಟು ಗಾತ್ರ",
      submit: "ಸಲ್ಲಿಸಿ",
      uploading: "ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      pleaseSelectPhoto: "ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಫೋಟೋವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      uploadingPhotos: "{count} ಫೋಟೋ(ಗಳನ್ನು) ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      uploadingPhoto: "ಫೋಟೋ {current} ರಿಂದ {total} ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      allPhotosUploaded:
        "ಎಲ್ಲಾ {count} ಫೋಟೋಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ!",
      somePhotosUploaded:
        "{success} ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ, {failed} ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ",
      allPhotosSavedOffline:
        "ಎಲ್ಲಾ ಫೋಟೋಗಳನ್ನು ನಂತರದ ಅಪ್‌ಲೋಡ್‌ಗಾಗಿ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ",
      uploadFailed: "ಅಪ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ",
      fullSizePhoto: "ಪೂರ್ಣ ಗಾತ್ರದ ಫೋಟೋ",
      tapOutsideToClose: "ಮುಚ್ಚಲು ಹೊರಗೆ ಟ್ಯಾಪ್ ಮಾಡಿ",
      breakfast: "ಬೆಳಗಿನ ಊಟ",
      lunch: "ಮಧ್ಯಾಹ್ನದ ಊಟ",
      snacks: "ತಿಂಡಿ",
      dinner: "ರಾತ್ರಿಯ ಊಟ",
    },
  };

  const t = translations[language];

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const upload = async () => {
    if (photos.length === 0) {
      setStatus(t.pleaseSelectPhoto);
      return;
    }

    setUploading(true);
    setStatus(t.uploadingPhotos.replace("{count}", photos.length));

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      setStatus(
        t.uploadingPhoto
          .replace("{current}", i + 1)
          .replace("{total}", photos.length)
      );

      const form = new FormData();
      form.append("photo", photo);
      form.append("mealType", mealType);
      form.append("schoolId", schoolId);

      try {
        const response = await apiService.uploadPhoto(form);

        if (response.success) {
          successCount++;

          // Photo will be automatically synced to web portal by the backend
        } else {
          throw new Error(t.uploadFailed);
        }
      } catch (err) {
        // Upload failed - save to offline queue
        failedCount++;
        await saveToQueue({ photo, mealType, schoolId });
      }
    }

    // Final status
    if (successCount === photos.length) {
      setStatus(t.allPhotosUploaded.replace("{count}", photos.length));
      setPhotos([]);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } else if (successCount > 0) {
      setStatus(
        t.somePhotosUploaded
          .replace("{success}", successCount)
          .replace("{failed}", failedCount)
      );
    } else {
      setStatus(t.allPhotosSavedOffline);
    }

    setUploading(false);
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  return (
    <div
      className="safe-area-top safe-area-bottom"
      style={{
        padding: isMobile ? "16px" : "20px",
        maxWidth: "600px",
        margin: "0 auto",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            to="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              backgroundColor: "white",
              borderRadius: "50%",
              textDecoration: "none",
              fontSize: "18px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            ←
          </Link>
          <h1
            style={{
              margin: "0",
              fontSize: isMobile ? "18px" : "24px",
              fontWeight: "700",
              color: "#1a202c",
            }}
          >
            {t.upload} {t[mealType]} {t.photo}
          </h1>
        </div>

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
            type="button"
            onClick={() => handleLanguageChange("en")}
            aria-label="Switch to English"
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
            type="button"
            onClick={() => handleLanguageChange("kn")}
            aria-label="Switch to Kannada"
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
      </div>

      {/* Upload Card */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: isMobile ? "20px" : "32px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Upload Info */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {/* Meal Type */}
          <div
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#f0f4ff",
              borderRadius: "8px",
              border: "1px solid #c7d2fe",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "20px", marginRight: "8px" }}>
                {mealType === "breakfast"
                  ? "🍳"
                  : mealType === "lunch"
                  ? "🍽️"
                  : mealType === "snacks"
                  ? "🍪"
                  : "🍛"}
              </span>
              <div>
                <p
                  style={{
                    margin: "0",
                    fontSize: "12px",
                    color: "#6366f1",
                    fontWeight: "500",
                  }}
                >
                  {t.mealType}
                </p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#3730a3",
                  }}
                >
                  {t[mealType]}
                </p>
              </div>
            </div>
          </div>

          {/* School Info */}
          <div
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#f0fdf4",
              borderRadius: "8px",
              border: "1px solid #bbf7d0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "20px", marginRight: "8px" }}>🏫</span>
              <div>
                <p
                  style={{
                    margin: "0",
                    fontSize: "12px",
                    color: "#059669",
                    fontWeight: "500",
                  }}
                >
                  {t.schoolId}
                </p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#065f46",
                  }}
                >
                  {schoolId || t.notSelected}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning if no school selected */}
        {!schoolId && (
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
              <div>
                <p
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "14px",
                    color: "#92400e",
                    fontWeight: "600",
                  }}
                >
                  {t.noSchoolSelected}
                </p>
                <p style={{ margin: "0", fontSize: "12px", color: "#a16207" }}>
                  {t.goBackToSelectSchool}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* File Input */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            📷 {t.takeOrSelectPhoto}
          </label>
          <div
            style={{
              position: "relative",
              border: "2px dashed #cbd5e0",
              borderRadius: "12px",
              padding: isMobile ? "32px 16px" : "40px 20px",
              textAlign: "center",
              backgroundColor: photos.length > 0 ? "#f0fff4" : "#fafafa",
              borderColor: photos.length > 0 ? "#10b981" : "#cbd5e0",
              transition: "all 0.2s ease",
            }}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={(e) => {
                const newFiles = Array.from(e.target.files);
                setPhotos((prev) => [...prev, ...newFiles]);
              }}
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                opacity: "0",
                cursor: "pointer",
              }}
            />
            <div
              style={{
                fontSize: isMobile ? "32px" : "48px",
                marginBottom: "8px",
              }}
            >
              {photos.length > 0 ? "✅" : "📸"}
            </div>
            <p
              style={{
                margin: "0",
                fontSize: isMobile ? "14px" : "16px",
                color: photos.length > 0 ? "#059669" : "#6b7280",
                fontWeight: photos.length > 0 ? "600" : "400",
              }}
            >
              {photos.length > 0
                ? `${photos.length} ${t.photosSelected}`
                : t.tapToSelectPhotos}
            </p>
            {photos.length > 0 && (
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                {t.selectMorePhotos}
              </p>
            )}
          </div>
        </div>

        {/* Photos Preview */}
        {photos.length > 0 && (
          <div
            style={{
              marginBottom: "24px",
              padding: "16px",
              backgroundColor: "#f0fff4",
              borderRadius: "12px",
              border: "1px solid #bbf7d0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "16px", marginRight: "8px" }}>🖼️</span>
                <p
                  style={{
                    margin: "0",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#059669",
                  }}
                >
                  {t.photosPreview} ({photos.length})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhotos([]);
                  const fileInput =
                    document.querySelector('input[type="file"]');
                  if (fileInput) fileInput.value = "";
                }}
                aria-label="Clear all photos"
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                🗑️ {t.clearAll}
              </button>
            </div>

            {/* Photos Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(3, 1fr)",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              {photos.map((photo, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setShowFullImage(true);
                  }}
                  style={{
                    position: "relative",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "80px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {/* Remove individual photo */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotos((prev) => prev.filter((_, i) => i !== index));
                    }}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      width: "20px",
                      height: "20px",
                      backgroundColor: "rgba(220, 38, 38, 0.9)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      fontSize: "10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                  {/* Photo number */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "4px",
                      left: "4px",
                      backgroundColor: "rgba(0,0,0,0.7)",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: "8px",
                      fontSize: "10px",
                      fontWeight: "500",
                    }}
                  >
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Size */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "12px",
                color: "#6b7280",
                padding: "8px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
              }}
            >
              <span>
                📏 {t.totalSize}:{" "}
                {(
                  photos.reduce((sum, photo) => sum + photo.size, 0) /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </span>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={upload}
          disabled={uploading || photos.length === 0 || !schoolId}
          style={{
            width: "100%",
            padding: isMobile ? "16px" : "14px",
            backgroundColor:
              uploading || photos.length === 0 || !schoolId
                ? "#e5e7eb"
                : "#10b981",
            color:
              uploading || photos.length === 0 || !schoolId
                ? "#9ca3af"
                : "white",
            border: "none",
            borderRadius: "12px",
            fontSize: isMobile ? "18px" : "16px",
            fontWeight: "600",
            cursor:
              uploading || photos.length === 0 || !schoolId
                ? "not-allowed"
                : "pointer",
            transition: "all 0.2s ease",
            boxShadow:
              uploading || photos.length === 0 || !schoolId
                ? "none"
                : "0 4px 12px rgba(16, 185, 129, 0.3)",
          }}
          onMouseEnter={(e) => {
            if (!uploading && photos.length > 0 && schoolId) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!uploading && photos.length > 0 && schoolId) {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
            }
          }}
        >
          {uploading ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid #ffffff40",
                  borderTop: "2px solid #ffffff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginRight: "8px",
                }}
              ></span>
              {t.uploading}
            </span>
          ) : (
            `📤 ${t.submit}`
          )}
        </button>

        {/* Status Message */}
        {status && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              backgroundColor: status.includes("success")
                ? "#d1fae5"
                : status.includes("Offline")
                ? "#fef3c7"
                : "#fee2e2",
              color: status.includes("success")
                ? "#065f46"
                : status.includes("Offline")
                ? "#92400e"
                : "#991b1b",
              borderRadius: "8px",
              border: `1px solid ${
                status.includes("success")
                  ? "#bbf7d0"
                  : status.includes("Offline")
                  ? "#fde68a"
                  : "#fecaca"
              }`,
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "8px", fontSize: "16px" }}>
                {status.includes("success")
                  ? "✅"
                  : status.includes("Offline")
                  ? "📱"
                  : "⚠️"}
              </span>
              {status}
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Image Modal */}
      {showFullImage && photos.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.95)",
            zIndex: "9999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowFullImage(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowFullImage(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "44px",
              height: "44px",
              backgroundColor: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.3)",
              borderRadius: "50%",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              zIndex: "10000",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(255,255,255,0.3)";
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(255,255,255,0.2)";
              e.target.style.transform = "scale(1)";
            }}
          >
            ✕
          </button>

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev > 0 ? prev - 1 : photos.length - 1
                  )
                }
                style={{
                  position: "absolute",
                  left: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "44px",
                  height: "44px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderRadius: "50%",
                  color: "white",
                  fontSize: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: "10000",
                }}
              >
                ←
              </button>
              <button
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev < photos.length - 1 ? prev + 1 : 0
                  )
                }
                style={{
                  position: "absolute",
                  right: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "44px",
                  height: "44px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderRadius: "50%",
                  color: "white",
                  fontSize: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: "10000",
                }}
              >
                →
              </button>
            </>
          )}

          {/* Full Size Image */}
          <img
            src={
              photos[selectedImageIndex]
                ? URL.createObjectURL(photos[selectedImageIndex])
                : ""
            }
            alt={t.fullSizePhoto}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Image Info Overlay */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "12px 20px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span>📄 {photos[selectedImageIndex]?.name}</span>
            <span>
              📏 {(photos[selectedImageIndex]?.size / 1024 / 1024).toFixed(2)}{" "}
              MB
            </span>
            {photos.length > 1 && (
              <span>
                📸 {selectedImageIndex + 1} of {photos.length}
              </span>
            )}
            <span>🔍 {t.tapOutsideToClose}</span>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
