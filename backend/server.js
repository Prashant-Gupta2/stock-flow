const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/",(req,res)=>{
      res.send("stock low API is working")    
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected successfully");

    await sequelize.sync();
    console.log("Database tables synchronized");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}
startServer();