const express = require("express");
const {
  GetTemplateNames,
  GetTemplateById,
  CreateTemplate,
  UpdateTemplateById,
  getTotalTemplates
} = require("../controllers/templateController");

const router = express.Router();

router.post("/create",authMiddleware, CreateTemplate);
router.get("/total",authMiddleware, getTotalTemplates);

router.get("/getAll/names",authMiddleware, GetTemplateNames);

router.get("/getById/:id",authMiddleware, GetTemplateById);

router.put("/update/:id", authMiddleware,UpdateTemplateById);

module.exports = router;
