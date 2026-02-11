const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    console.log("Request received:", name, email);

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Coding Club Website",
          email: process.env.ADMIN_EMAIL1,
        },
        to: [
          {
            email: process.env.ADMIN_EMAIL1,
          },
        ],
        replyTo: {
          email: email,
          name: name,
        },
        subject: "New Contact Form Submission",
        htmlContent: `
          <div style="font-family: Arial; padding: 20px;">
            <h2>New Contact Request</h2>
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Message:</b> ${message}</p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent:", response.data);

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error("❌ MAIL ERROR:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
});

module.exports = router;
