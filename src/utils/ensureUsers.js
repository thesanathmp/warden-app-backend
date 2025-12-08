import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Users that should always exist in the system
const requiredUsers = [
  {
    name: "Poornima",
    phone: "8197801357",
    password: "Poornima@123",
    role: "warden",
    schoolId: "SCH001"
  },
  {
    name: "Shwetha S",
    phone: "7411971061",
    password: "Shwetha@1235",
    role: "warden",
    schoolId: "SCH002"
  }
];

/**
 * Ensures required users exist in the database
 * Called automatically on server startup
 */
export const ensureRequiredUsers = async () => {
  try {
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const userData of requiredUsers) {
      try {
        const existingUser = await User.findOne({ phone: userData.phone });
        
        if (existingUser) {
          skippedCount++;
        } else {
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          
          await User.create({
            ...userData,
            password: hashedPassword
          });
          
          console.log(`✅ Created required user: ${userData.name} (${userData.phone})`);
          createdCount++;
        }
      } catch (error) {
        console.error(`❌ Error ensuring user ${userData.phone}:`, error.message);
      }
    }
    
    if (createdCount > 0) {
      console.log(`📊 Required users check: ${createdCount} created, ${skippedCount} already exist`);
    }
  } catch (error) {
    console.error("❌ Error ensuring required users:", error.message);
    // Don't throw - allow server to start even if user creation fails
  }
};

