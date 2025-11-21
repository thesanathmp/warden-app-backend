import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const users = [
  {
    name: "John Warden",
    phone: "9876543210",
    password: "password123",
    role: "warden",
    schoolId: "SCH001"
  },
  {
    name: "Sarah Warden",
    phone: "9876543211", 
    password: "password123",
    role: "warden",
    schoolId: "SCH002"
  },
  {
    name: "Mike Officer",
    phone: "9876543212",
    password: "password123", 
    role: "officer",
    schoolId: null
  },
  {
    name: "Admin User",
    phone: "9876543213",
    password: "admin123",
    role: "super_admin",
    schoolId: null
  },
  {
    name: "District Officer",
    phone: "9876543214",
    password: "password123",
    role: "district_officer", 
    schoolId: null
  }
];

const seedUsers = async () => {
  try {
    await connectDB();
    
    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");
    
    // Hash passwords and insert users
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      await User.create({
        ...userData,
        password: hashedPassword
      });
      
      console.log(`Created user: ${userData.name} (${userData.phone}) - Role: ${userData.role}`);
    }
    
    console.log("\n✅ Users seeded successfully!");
    console.log("\n📱 Test Login Credentials:");
    console.log("=".repeat(50));
    
    users.forEach(user => {
      console.log(`📞 Phone: ${user.phone}`);
      console.log(`🔑 Password: ${user.password}`);
      console.log(`👤 Role: ${user.role}`);
      if (user.schoolId) console.log(`🏫 School: ${user.schoolId}`);
      console.log("-".repeat(30));
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();