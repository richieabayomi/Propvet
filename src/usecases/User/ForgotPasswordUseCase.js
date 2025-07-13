const crypto = require('crypto');
const UserRepository = require('../../infrastructure/Repository/user.repository');
const BadRequestError = require('../../misc/errors/BadRequestError');
const NotFoundError = require('../../misc/errors/NotFoundError');
const { isString, isEmail } = require('../../misc/services/data-types');
const { sendMail, emailTemplates } = require('../../misc/services/mail');

const userRepository = new UserRepository();

class ForgotPasswordUseCase {
  async execute(email) {
    if (!email || !isString(email)) throw new BadRequestError("A valid email is required.");

    const user = await userRepository.getUserByEmail(email);
    if (!user || user.deleted) {
      throw new NotFoundError("User not found.");
    }

    const otp = (parseInt(crypto.randomBytes(4).toString('hex'), 16) % 900000 + 100000).toString();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await userRepository.updateUser(user.id, {
      auth_expires_at: expires,
      permissions: [...new Set([...user.permissions, "RESET_PASSWORD"])], // optional
    });

    const userName = user.first_name || user.username || 'User';
    const emailTemplate = emailTemplates.passwordReset(userName, otp);
    
    await sendMail({
      to: email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html
    });

    return { expires };
  }
}

module.exports = ForgotPasswordUseCase;
