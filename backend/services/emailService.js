const transporter = require('../config/mailer');
const logger = require('../config/logger');

// Plantilla base para todos los correos
const emailTemplate = (title, content, preheader = "") => `
  <div style="
    max-width: 480px; margin: 40px auto; padding: 32px;
    background-color: #1b4d1b; border-radius: 16px;
    font-family: 'Arial', sans-serif; color: #f0f0f0;
    text-align: center; border: 2px solid #67E67C;
    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  ">
    <span style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>
    <img src="http://localhost:3001/logo.svg" alt="Kal'O Fit" style="width: 90px; margin-bottom: 24px;" />
    <h2 style="margin-bottom: 16px; font-size: 26px; color: #67E67C;">${title}</h2>
    ${content}
    <hr style="border: none; border-top: 1px solid #67E67C; margin: 32px 0;" />
    <p style="font-size: 12px; color: #aaa;">© 2025 Kal'O Fit. All rights reserved.</p>
  </div>
`;

const emailService = {
  /**
   * Envía un correo de propósito general.
   */
  async send(to, subject, content, preheader) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: emailTemplate(subject, content, preheader),
      });
      logger.info(`Email sent to: ${to} | Subject: ${subject}`);
    } catch (err) {
      logger.error(`Error sending email to ${to}: ${err.message}`);
    }
  },

  /**
   * Envía el correo de recordatorio de comida.
   */
  async sendFoodReminder(to, name, reminderName) {
    const title = `¡Hora de tu ${reminderName}!`;
    const content = `
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 28px;">
        ¡Hola <strong>${name}</strong>!<br/>
        Solo es un recordatorio rápido de que es hora de registrar tu <strong>${reminderName}</strong>.
      </p>
      <a href="${process.env.APP_ORIGIN || 'http://localhost:3000'}" style="
        display: inline-block; background-color: #67E67C; color: #1b1b1b;
        text-decoration: none; padding: 14px 32px; border-radius: 12px;
        font-weight: bold; font-size: 16px;
      ">
        Registrar Comida
      </a>
    `;
    await this.send(to, title, content, `¡Es hora de registrar tu ${reminderName}!`);
  },

  /**
   * Envía el correo de verificación.
   * (Esta lógica es movida desde authController)
   */
  async sendVerificationEmail(to, name, verifyUrl) {
    const title = "¡Bienvenido a Kal'O Fit!";
    const content = `
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 28px;">
        Hola <strong>${name}</strong>,<br/>
        Por favor confirma tu dirección de correo haciendo clic en el botón:
      </p>
      <a href="${verifyUrl}" style="
        display: inline-block; background-color: #67E67C; color: #1b1b1b;
        text-decoration: none; padding: 14px 32px; border-radius: 12px;
        font-weight: bold; font-size: 16px;
      ">
        Verificar Correo
      </a>
      <p style="font-size: 14px; color: #d1ffd1; margin-top: 28px;">
        Este enlace expira en 1 hora.
      </p>
    `;
    await this.send(to, "Confirma tu correo - Kal'O Fit", content, "Confirma tu correo de Kal'O Fit");
  },
  
  // (Aquí también moverías la lógica de 'sendResetCode' de authController)
};

module.exports = emailService;