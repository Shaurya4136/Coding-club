const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

// POST route for contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    console.log("Request received:", name, email);

    // ✅ Brevo SMTP transporter
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,   // Brevo Login (a21fac001@smtp-brevo.com)
        pass: process.env.BREVO_SMTP_PASS,   // Brevo SMTP Key
      },
    });

    // ✅ Verify SMTP connection
    await transporter.verify();
    console.log("✅ Brevo SMTP connected successfully");

    // ✅ Send email to ADMIN_EMAIL1
    const info = await transporter.sendMail({
      from: `"Coding Club Website" <${process.env.ADMIN_EMAIL1}>`,
      to: process.env.ADMIN_EMAIL1,
      replyTo: email,
      subject: "New Contact Form Submission",
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

    console.log("✅ Email sent successfully:", info.messageId);

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
