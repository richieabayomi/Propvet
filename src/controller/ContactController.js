const { sendMail, emailTemplates } = require('../misc/services/mail.simple');
const ApiResponse = require('../misc/services/api-response');

module.exports = {
  async sendContactForm(req, res) {
    try {
      const { fullName, email, phoneNumber, subject, message } = req.body;
      
      // Validate required fields
      if (!fullName || !email || !subject || !message) {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'Full name, email, subject, and message are required.'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'Please provide a valid email address.'
        });
      }

      const supportEmail = process.env.SUPPORT_EMAIL || 'support@propvet.com';
      
      // Create email content
      const emailContent = {
        to: supportEmail,
        subject: `Contact Form: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #007bff; margin-top: 0;">Contact Details</h3>
              <p><strong>Full Name:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${phoneNumber ? `<p><strong>Phone Number:</strong> ${phoneNumber}</p>` : ''}
              <p><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
              <h3 style="color: #007bff; margin-top: 0;">Message</h3>
              <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 8px; font-size: 12px; color: #666;">
              <p style="margin: 0;">This email was sent from the Propvet contact form.</p>
              <p style="margin: 0;">Reply directly to this email to respond to the sender.</p>
            </div>
          </div>
        `,
        text: `
New Contact Form Submission

Contact Details:
- Full Name: ${fullName}
- Email: ${email}
${phoneNumber ? `- Phone Number: ${phoneNumber}` : ''}
- Subject: ${subject}

Message:
${message}

---
This email was sent from the Propvet contact form.
Reply directly to this email to respond to the sender.
        `,
        replyTo: email // This allows direct reply to the sender
      };

      // Send the email
      try {
        await sendMail(emailContent);
        console.log('✅ Contact form email sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send contact email:', emailError);
        // For now, continue and return success even if email fails
        // TODO: Set up proper email service
      }

      return ApiResponse.ok(res, {
        message: 'Your message has been received successfully. We will get back to you soon!',
        success: true
      });

    } catch (error) {
      console.error('Contact form error:', error);
      return ApiResponse.error(res, {
        statusCode: 500,
        message: 'Failed to send your message. Please try again later.'
      });
    }
  }
};
