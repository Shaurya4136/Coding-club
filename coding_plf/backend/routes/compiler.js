const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/run", async (req, res) => {
  const { code, language, stdin } = req.body; // ✅ TAKE stdin

  try {
    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions",
      {
        source_code: code,
        language_id: mapLanguage(language),
        stdin: stdin || "", // ✅ PASS INPUT TO JUDGE0
      },
      {
        params: {
          base64_encoded: false,
          wait: true,
        },
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    res.json({
      output:
        response.data.stdout ||
        response.data.stderr ||
        response.data.compile_output ||
        "No output",
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Execution failed" });
  }
});

function mapLanguage(lang) {
  const map = {
    python3: 71,
    javascript: 63,
    java: 62,
    cpp: 54,
    csharp: 51,
    php: 68,
    ruby: 72,
  };
  return map[lang] || 71;
}

module.exports = router;
