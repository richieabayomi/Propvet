# EMAIL SETUP GUIDE FOR PROPVET

## Overview
Propvet now sends automated emails for:
- **Welcome emails** when users register
- **Password reset emails** with secure links
- **Verification created emails** with payment links
- **Payment confirmation emails** when payment is successful

## 🚀 Quick Setup

### 1. Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update .env file**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_gmail@gmail.com
   SMTP_PASS=your_16_character_app_password
   SMTP_FROM_NAME=Propvet
   SMTP_FROM=your_gmail@gmail.com
   ```

### 2. Other Email Providers

#### **Outlook/Hotmail**
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
```

#### **Yahoo Mail**
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_app_password
```

#### **SendGrid (Production)**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

#### **Mailgun (Production)**
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASS=your_mailgun_password
```

## 📧 Email Templates Included

### 1. **Welcome Email**
- Sent when user registers
- Includes login link
- Professional design with Propvet branding

### 2. **Password Reset Email**
- Sent when user requests password reset
- Secure reset link (expires in 1 hour)
- Clear security messaging

### 3. **Verification Created Email**
- Sent when user creates verification
- Includes payment link
- Shows verification details

### 4. **Payment Confirmed Email**
- Sent when payment is successful
- Includes next steps
- Link to upload documents

## 🔧 Testing Email Functionality

### 1. **Test Email Service**
Start your server and check console for:
```
✅ SMTP Server is ready to send emails
```

### 2. **Test User Registration**
```bash
POST /auth/register
{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User",
  "phone": "+1234567890"
}
```
Should send welcome email.

### 3. **Test Password Reset**
```bash
POST /auth/forgot-password
{
  "email": "test@example.com"
}
```
Should send password reset email.

### 4. **Test Verification Emails**
Create verification → Should send verification created email
Complete payment → Should send payment confirmed email

## 🐛 Troubleshooting

### **Error: SMTP Configuration Error**
1. Check your SMTP credentials
2. Ensure 2FA is enabled (for Gmail)
3. Use app password instead of regular password
4. Check firewall/network restrictions

### **Error: Authentication failed**
1. Verify SMTP_USER and SMTP_PASS
2. For Gmail: Use app password, not account password
3. Check if "Less secure app access" is enabled (not recommended)

### **Emails not being sent**
1. Check console for error messages
2. Verify environment variables are loaded
3. Test with a simple email service first
4. Check spam folder

### **HTML emails not rendering**
1. Check email client HTML support
2. Test with different email clients
3. Emails include both text and HTML versions

## 🔒 Security Best Practices

1. **Never commit email credentials** to version control
2. **Use app passwords** instead of account passwords
3. **Use production email services** (SendGrid, Mailgun) for production
4. **Monitor email sending logs** for suspicious activity
5. **Set up email rate limiting** to prevent abuse

## 📊 Email Service Monitoring

The system logs all email activities:
- ✅ Successful sends
- ❌ Failed sends with error details
- Email recipient and subject for tracking

Monitor your console/logs for email-related messages.

## 🎨 Customizing Email Templates

Email templates are in `/src/misc/services/mail.js`:

```javascript
const emailTemplates = {
  welcome: (userName, loginUrl) => ({
    subject: 'Your custom subject',
    html: 'Your custom HTML template'
  })
}
```

You can customize:
- Subject lines
- HTML templates
- Styling and branding
- Content and messaging

## 🚀 Production Deployment

For production:
1. Use professional email service (SendGrid, Mailgun, SES)
2. Set up proper DNS records (SPF, DKIM, DMARC)
3. Use dedicated sending domain
4. Monitor delivery rates and reputation
5. Set up bounce/complaint handling

This completes the email integration for your Propvet application! 📧✨
