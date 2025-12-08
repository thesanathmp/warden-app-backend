import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import { ensureRequiredSchools } from "./utils/ensureSchools.js";
import { ensureRequiredUsers } from "./utils/ensureUsers.js";
import app from "./app.js";

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Ensure required schools exist first (users reference schools)
    await ensureRequiredSchools();
    
    // Ensure required users exist
    await ensureRequiredUsers();
    
    // Start server
    app.listen(process.env.PORT, () =>
      console.log("Server running on port " + process.env.PORT)
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
