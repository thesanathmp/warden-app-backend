import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import School from "../models/School.js";

dotenv.config();

const schools = [
  {
    schoolId: "SCH001",
    name: "Government Primary School Sector 1",
    district: "District A"
  },
  {
    schoolId: "SCH002", 
    name: "Government Primary School Sector 2",
    district: "District A"
  },
  {
    schoolId: "SCH003",
    name: "Government High School Central",
    district: "District B"
  },
  {
    schoolId: "SCH004",
    name: "Government Primary School East",
    district: "District B"
  },
  {
    schoolId: "SCH005",
    name: "Government Secondary School West",
    district: "District C"
  }
];

const seedSchools = async () => {
  try {
    await connectDB();
    
    // Clear existing schools
    await School.deleteMany({});
    console.log("Cleared existing schools");
    
    // Insert new schools
    await School.insertMany(schools);
    console.log("Schools seeded successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding schools:", error);
    process.exit(1);
  }
};

seedSchools();