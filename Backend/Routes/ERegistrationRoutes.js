const express = require("express");
const router = express.Router();

router.post("/register");
router.get("/");
router.get("/:id");
router.delete("/:id");

module.exports = router;
