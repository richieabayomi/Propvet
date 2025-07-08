const crypto = require('crypto');
const UserRepository = require('../../infrastructure/Repository/user.repository');
const BadRequestError = require('../../misc/errors/BadRequestError');
const NotFoundError = require('../../misc/errors/NotFoundError');
const { isString, isEmail } = require('../../misc/services/data-types');
const { sendMail } = require('../../misc/services/mail');

const userRepository = new UserRepository();

class ForgotPasswordUseCase {
  async execute(email) {
    if (!email || !isString(email)) throw new BadRequestError("A valid email is required.");

    const user = await userRepository.getUserByEmail(email);
    if (!user || user.deleted) {
      throw new NotFoundError("User not found.");
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await userRepository.updateUser(user.id, {
      auth_expires_at: expires,
      permissions: [...new Set([...user.permissions, "RESET_PASSWORD"])], // optional
    });

    // Send password reset email
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    await sendMail({
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Use this link: ${resetLink} (valid for 1 hour)`,
      html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Reset Password</a></p><p>This link is valid for 1 hour.</p>`
    });

    return { reset_token: resetToken, expires };
  }
}

module.exports = ForgotPasswordUseCase;
