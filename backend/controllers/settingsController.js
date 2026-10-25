
const Organization = require("../models/Organization");

// Get organization settings
exports.getSettings = async (req, res) => {
  try {
    const organization = await Organization.findByPk(
      req.user.organizationId
    );

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    return res.status(200).json({
      settings: {
        organizationName: organization.name,
        defaultLowStockThreshold:
          organization.defaultLowStockThreshold,
      },
    });
  } catch (error) {
    console.error("Get settings error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch settings",
    });
  }
};

// Update organization settings
exports.updateSettings = async (req, res) => {
  try {
    const { organizationName, defaultLowStockThreshold } = req.body;

    const organization = await Organization.findByPk(
      req.user.organizationId
    );

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    if (organizationName !== undefined) {
      if (
        typeof organizationName !== "string" ||
        !organizationName.trim()
      ) {
        return res.status(400).json({
          message: "Organization name cannot be empty",
        });
      }

      organization.name = organizationName.trim();
    }

    if (defaultLowStockThreshold !== undefined) {
      if (
        !Number.isInteger(defaultLowStockThreshold) ||
        defaultLowStockThreshold < 0
      ) {
        return res.status(400).json({
          message:
            "Default low-stock threshold must be a non-negative integer",
        });
      }

      organization.defaultLowStockThreshold =
        defaultLowStockThreshold;
    }

    await organization.save();

    return res.status(200).json({
      message: "Settings updated successfully",
      settings: {
        organizationName: organization.name,
        defaultLowStockThreshold:
          organization.defaultLowStockThreshold,
      },
    });
  } catch (error) {
    console.error("Update settings error:", error.message);

    return res.status(500).json({
      message: "Failed to update settings",
    });
  }
};
