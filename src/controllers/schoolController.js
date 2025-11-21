import School from "../models/School.js";

export const createSchool = async (req, res) => {
  try {
    const { schoolId, name, district } = req.body;
    
    // Check if school already exists
    const existingSchool = await School.findOne({ schoolId });
    if (existingSchool) {
      return res.status(400).json({ message: "School already exists" });
    }

    const school = await School.create({
      schoolId,
      name,
      district
    });

    res.status(201).json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ name: 1 });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSchoolById = async (req, res) => {
  try {
    const school = await School.findOne({ schoolId: req.params.id });
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    res.json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};