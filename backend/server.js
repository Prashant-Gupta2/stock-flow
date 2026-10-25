const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const User = require('./models/User');
const Organization = require('./models/Organization');
const Product = require('./models/Product');

app.get("/",(req,res)=>{
      res.send("stock low API is working")    
});

Organization.hasOne(User, {
  foreignKey: "organizationId",
});

User.belongsTo(Organization, {
  foreignKey: "organizationId",
});

Organization.hasMany(Product, {
  foreignKey: "organizationId",
});

Product.belongsTo(Organization, {
  foreignKey: "organizationId",
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