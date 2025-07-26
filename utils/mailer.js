import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_TRAP_SMTP_HOST || "smtp.ethereal.email",
      port: process.env.MAIL_TRAP_SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_TRAP_SMTP_USER || "your_mailtrap_username",
        pass: process.env.MAIL_TRAP_SMTP_PASS || "your_mailtrap_password",
      },
    });


    const info = await transporter.sendMail({
    from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
    to: "bar@example.com, baz@example.com",
    subject: "Hello ✔",
    text: "Hello world?", // plain‑text body
    html: "<b>Hello world?</b>", // HTML body
  });

  console.log("Message sent:", info.messageId);




  } catch (error) {
    console.error("Error creating transporter:", error);
    throw new Error("Failed to create email transporter");
  }
};
