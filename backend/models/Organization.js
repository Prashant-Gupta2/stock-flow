
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Organization = sequelize.define(
  "Organization",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Organization name is required",
        },
      },
    },

    defaultLowStockThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: {
          args: [0],
          msg: "Low-stock threshold cannot be negative",
        },
      },
    },
  },
  {
    tableName: "organizations",
    timestamps: true,
  }
);

module.exports = Organization;
