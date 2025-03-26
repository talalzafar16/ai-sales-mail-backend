const express = require("express");
const {
  GetTemplateNames,
  GetTemplateById,
  CreateTemplate,
  UpdateTemplateById,
  getTotalTemplates
} = require("../controllers/templateController");

const router = express.Router();

router.post("/create", CreateTemplate);
router.get("/total", getTotalTemplates);

router.get("/getAll/names", GetTemplateNames);

router.get("/getById/:id", GetTemplateById);

router.put("/update/:id", UpdateTemplateById);

module.exports = router;
