const express = require("express");
const router = express.Router();

const { askDoubt, explainTopic, generateQuiz } = require("../controllers/AI.js");
const { auth } = require("../middlewares/auth");

// AI Tutor Routes (Protected by Auth)
router.post("/ask-doubt", auth, askDoubt);
router.post("/explain-topic", auth, explainTopic);
router.post("/generate-quiz", auth, generateQuiz);

module.exports = router;
