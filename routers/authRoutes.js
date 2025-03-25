const express = require("express");
const { signup, login } = require("../controllers/authController");
const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/signup",
  [
    body("firstname").notEmpty().withMessage("Firstname is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  signup
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  login
);

module.exports = router;
