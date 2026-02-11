const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

// POST route for contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    console.log("Request received:", name, email);

    // ✅ Create transporter using Gmail service (RENDER SAFE CONFIG)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
      },
    });

    // ✅ Verify SMTP connection
    await transporter.verify();
    console.log("✅ SMTP connected successfully");

    // ✅ Send email
    const info = await transporter.sendMail({
      from: `"Coding Club Website" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Contact Form Submission",
      replyTo: email, // allows direct reply to user
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          
          <div style="
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
          ">
            ${message}
          </div>

          <br/>

          <p style="font-size: 12px; color: gray;">
            This email was sent from Coding Club website contact form.
          </p>
        </div>
      `,
    });

    console.log("✅ Email sent:", info.messageId);

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error("❌ MAIL ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
});

module.exports = router;
