import School from "../models/School.js";

// Schools that should always exist in the system
// These are referenced by the required users
const requiredSchools = [
  {
    schoolId: "SCH001",
    name: "Minority Post Matric Girls Hostel Subedar Chatram Road Sheshadripuram Sheshadripuram 560020",
    district: "Bangalore North"
  },
  {
    schoolId: "SCH002",
    name: "Minority Working Women Hostel Subedar Chatram Road Sheshadripuram Sheshadripuram 560020",
    district: "Bangalore North"
  }
];

/**
 * Ensures required schools exist in the database
 * Called automatically on server startup before users
 */
export const ensureRequiredSchools = async () => {
  try {
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const schoolData of requiredSchools) {
      try {
        const existingSchool = await School.findOne({ schoolId: schoolData.schoolId });
        
        if (existingSchool) {
          skippedCount++;
        } else {
          await School.create(schoolData);
          
          console.log(`✅ Created required school: ${schoolData.name} (${schoolData.schoolId})`);
          createdCount++;
        }
      } catch (error) {
        console.error(`❌ Error ensuring school ${schoolData.schoolId}:`, error.message);
      }
    }
    
    if (createdCount > 0) {
      console.log(`📊 Required schools check: ${createdCount} created, ${skippedCount} already exist`);
    }
  } catch (error) {
    console.error("❌ Error ensuring required schools:", error.message);
    // Don't throw - allow server to start even if school creation fails
  }
};

