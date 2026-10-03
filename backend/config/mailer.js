import env from "./env.js";
import nodemailer from "nodemailer";

const requiredSmtpValue = (name, value) => {
  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }

  return value;
};

const transporter = nodemailer.createTransport({
  host: requiredSmtpValue("SMTP_HOST", env.SMTP_HOST),
  port: requiredSmtpValue("SMTP_PORT", env.SMTP_PORT),
  secure: env.SMTP_PORT === 465,
  auth: {
    user: requiredSmtpValue("SMTP_USER", env.SMTP_USER),
    pass: requiredSmtpValue("SMTP_PASS", env.SMTP_PASS),
  },
});

export default transporter;