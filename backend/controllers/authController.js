
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Organization = require("../models/Organization");
const User = require("../models/User");


exports.signup = async (req, res) => {
  const transaction = await require("../config/db").transaction();

  try {
    const { email, password, organizationName } = req.body;

    if (!email || !password || !organizationName) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Email, password, and organization name are required",
      });
    }

    if (password.length < 8) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({
      where: { email },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const organization = await Organization.create(
      { name: organizationName.trim() },
      { transaction }
    );

    const user = await User.create(
      {
        organizationId: organization.id,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Signup error:", error.message);
    return res.status(500).json({
      message: "Failed to create account",
    });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        organizationId: user.organizationId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Login failed",
    });
  }
};
