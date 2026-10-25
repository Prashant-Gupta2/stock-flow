
const { Op, fn, col } = require("sequelize");

const Product = require("../models/Product");
const Organization = require("../models/Organization");

exports.getDashboard = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    // Get organization settings
    const organization = await Organization.findByPk(organizationId);

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    const defaultThreshold =
      organization.defaultLowStockThreshold;

    // Calculate product count and total stock
    const summary = await Product.findOne({
      where: { organizationId },
      attributes: [
        [fn("COUNT", col("id")), "totalProducts"],
        [
          fn("COALESCE", fn("SUM", col("quantity")), 0),
          "totalStock",
        ],
      ],
      raw: true,
    });

    // Get products with a threshold at or below their stock quantity
    const products = await Product.findAll({
      where: {
        organizationId,
        [Op.or]: [
          {
            lowStockThreshold: {
              [Op.ne]: null,
            },
          },
          {
            lowStockThreshold: null,
          },
        ],
      },
      attributes: [
        "id",
        "name",
        "sku",
        "quantity",
        "lowStockThreshold",
      ],
      order: [["quantity", "ASC"]],
    });

    // Apply product-specific threshold or organization default
    const lowStockItems = products
      .map((product) => {
        const item = product.toJSON();

        const threshold =
          item.lowStockThreshold ?? defaultThreshold;

        return {
          ...item,
          effectiveLowStockThreshold: threshold,
        };
      })
      .filter(
        (product) =>
          product.quantity <= product.effectiveLowStockThreshold
      );

    return res.status(200).json({
      summary: {
        totalProducts: Number(summary.totalProducts),
        totalStock: Number(summary.totalStock),
      },
      lowStockItems,
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);

    return res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
};
