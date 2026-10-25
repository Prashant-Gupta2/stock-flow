
const { Op } = require("sequelize");
const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      quantity,
      costPrice,
      sellingPrice,
      lowStockThreshold,
    } = req.body;

    if (!name?.trim() || !sku?.trim()) {
      return res.status(400).json({
        message: "Product name and SKU are required",
      });
    }

    const organizationId = req.user.organizationId;
    const normalizedSku = sku.trim();

    const existingProduct = await Product.findOne({
      where: {
        organizationId,
        sku: normalizedSku,
      },
    });

    if (existingProduct) {
      return res.status(409).json({
        message: "SKU already exists in your organization",
      });
    }

    const product = await Product.create({
      organizationId,
      name: name.trim(),
      sku: normalizedSku,
      description,
      quantity: quantity ?? 0,
      costPrice: costPrice ?? null,
      sellingPrice: sellingPrice ?? null,
      lowStockThreshold: lowStockThreshold ?? null,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    return res.status(500).json({
      message: "Failed to create product",
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { search } = req.query;

    const where = {
      organizationId: req.user.organizationId,
    };

    // Search by product name or SKU
    if (search?.trim()) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { sku: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    const products = await Product.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

// get product by id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error("Get product error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};