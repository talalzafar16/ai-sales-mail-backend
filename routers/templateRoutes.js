const express = require("express");
const {
  GetTemplateNames,
  GetTemplateById,
  CreateTemplate,
  UpdateTemplateById,
} = require("../controllers/templateController");

const router = express.Router();

router.post("/create", CreateTemplate);

router.get("/getAll/names", GetTemplateNames);

router.get("/getById/:id", GetTemplateById);

router.put("/update/:id", UpdateTemplateById);

module.exports = router;
