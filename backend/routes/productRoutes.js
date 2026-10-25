
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

router.post("/", authMiddleware, createProduct);
router.get("/",authMiddleware, getProducts);

//update products
router.put("/:id", authMiddleware, updateProduct);

// Delete product
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;
