const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const brandHeader = `
  <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 25px; text-align: center; border-radius: 12px 12px 0 0; display: flex; align-items: center; justify-content: center; gap: 15px;">
    <span style="color: white; font-size: 32px; font-family: 'Montserrat', Arial, sans-serif; font-weight: 800; letter-spacing: 1px; vertical-align: middle;">ZING_<span style="color: #FF6B35;">BITES</span></span>
  </div>
`;

// Helper to get frontend URL
const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
};

// Removed commonAttachments to prevent attachment icon in Gmail notifications

const brandFooter = `
  <div style="background: #1a1a2e; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; margin-top: 0;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">© 2024 Zing Bites · Chennai, Tamil Nadu</p>
    <p style="color: #aaa; font-size: 12px; margin: 5px 0 0;">Open Daily: 6:00 PM – 11:00 PM · 📞 +91 98765 43210</p>
  </div>
`;

async function sendOTPEmail(email, name, otp) {
  const mailOptions = {
    from: `"Zing Bites 🚚" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Your OTP for Zing Bites Verification',
    html: `
      <div style="max-width: 500px; margin: 0 auto; font-family: Arial, sans-serif; background: #f9f9f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        ${brandHeader}
        <div style="background: white; padding: 35px;">
          <h2 style="color: #1a1a2e; margin: 0 0 10px; text-align: center;">Hi ${name}! 👋</h2>
          <p style="color: #555; line-height: 1.6; text-align: center;">Use the OTP below to verify your Zing Bites order:</p>
          <div style="background: #f8f9fa; border: 2px dashed #FF6B35; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
            <p style="color: #666; margin: 0 0 8px; font-size: 12px; letter-spacing: 2px; font-weight: 700;">YOUR VERIFICATION CODE</p>
            <div style="color: #1a1a2e; font-size: 42px; font-weight: bold; letter-spacing: 10px;">${otp}</div>
          </div>
          <p style="color: #e74c3c; font-size: 13px; text-align: center;">⏰ This OTP expires in <strong>10 minutes</strong>.</p>
        </div>
        ${brandFooter}
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
}

async function sendOrderConfirmationEmail(email, name, order) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Zing Bites 🚚" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎉 Order Confirmed! #${order.order_number}`,
    html: `
      <div style="max-width: 550px; margin: 0 auto; font-family: Arial, sans-serif; background: #f9f9f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        ${brandHeader}
        <div style="background: white; padding: 35px;">
          <h2 style="color: #1a1a2e; margin: 0 0 5px;">Order Confirmed! 🎊</h2>
          <p style="color: #555;">Hi ${name}, your order has been placed successfully!</p>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #FF6B35;">
            <p style="margin: 0; color: #333;"><strong>Order #:</strong> ${order.order_number}</p>
            <p style="margin: 5px 0 0; color: #333;"><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left; color: #333;">Item</th>
                <th style="padding: 10px; text-align: center; color: #333;">Qty</th>
                <th style="padding: 10px; text-align: right; color: #333;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr style="background: linear-gradient(135deg, #FF6B35, #FF8C42);">
                <td colspan="2" style="padding: 12px; color: white; font-weight: bold;">Total Amount</td>
                <td style="padding: 12px; color: white; font-weight: bold; text-align: right;">₹${order.total_amount}</td>
              </tr>
            </tfoot>
          </table>
          <div style="background: #e8f5e9; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="color: #2e7d32; margin: 0;">🕕 Ready for pickup between <strong>6 PM – 11 PM</strong></p>
            <p style="color: #2e7d32; margin: 5px 0 0;">📍 Find us in Chennai via live location on our website!</p>
          </div>
        </div>
        ${brandFooter}
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
}

async function sendContactNotification(message) {
  const mailOptions = {
    from: `"Zing Bites Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `📩 New Contact Message from ${message.name}`,
    html: `
      <div style="max-width: 500px; margin: 0 auto; font-family: Arial, sans-serif; background: #f9f9f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        ${brandHeader}
        <div style="background: white; padding: 35px;">
          <h2 style="color: #1a1a2e;">New Contact Message</h2>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 15px 0;">
            <p><strong>Name:</strong> ${message.name}</p>
            <p><strong>Email:</strong> ${message.email}</p>
            <p><strong>Phone:</strong> ${message.phone || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 6px; border-left: 3px solid #FF6B35;">${message.message}</p>
          </div>
          <p style="color: #888; font-size: 12px;">Received at: ${new Date().toLocaleString('en-IN')}</p>
        </div>
        ${brandFooter}
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
}

async function sendOrderStatusUpdateEmail(email, name, order, newStatus) {
  const statusConfig = {
    'confirmed': { icon: '✅', text: 'Confirmed', color: '#FF6B35', subtext: 'Your order has been accepted and will be prepared soon.' },
    'preparing': { icon: '👨‍🍳', text: 'Preparing', color: '#FFB703', subtext: 'Our chefs are now preparing your delicious meal!' },
    'ready': { icon: '🛍️', text: 'Ready', color: '#2ecc71', subtext: 'Your order is ready for pickup/delivery!' },
    'delivered': { icon: '🚚', text: 'Delivered', color: '#3498db', subtext: 'Enjoy your Zing Bites! We hope to see you again soon.' },
    'cancelled': { icon: '❌', text: 'Cancelled', color: '#e74c3c', subtext: 'Your order has been cancelled. Please contact us for details.' }
  };

  const config = statusConfig[newStatus] || { icon: '📦', text: newStatus, color: '#FF6B35', subtext: `Your order status has changed to ${newStatus}` };

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 13px;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; font-size: 13px;">${item.quantity}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Zing Bites 🚚" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${config.icon} Order Status Update: ${config.text} (#${order.order_number})`,
    html: `
      <div style="max-width: 550px; margin: 0 auto; font-family: Arial, sans-serif; background: #f9f9f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        ${brandHeader}
        <div style="background: white; padding: 35px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 50px; margin-bottom: 15px;">${config.icon}</div>
            <h2 style="color: #1a1a2e; margin: 0 0 10px;">Order ${config.text}!</h2>
            <p style="color: #666; margin: 0; font-size: 15px;">${config.subtext}</p>
          </div>

          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid ${config.color};">
            <p style="margin: 0; color: #333; font-size: 14px;"><strong>Order #:</strong> ${order.order_number}</p>
            <p style="margin: 5px 0 0; color: #333; font-size: 14px;"><strong>Customer:</strong> ${name}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 8px; text-align: left; color: #333; font-size: 12px;">Item</th>
                <th style="padding: 8px; text-align: center; color: #333; font-size: 12px;">Qty</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          ${newStatus === 'delivered' ? `
          <div style="margin-top: 40px; padding: 30px; background: #fffcf0; border-radius: 12px; text-align: center; border: 1px dashed #FFB703;">
            <h3 style="color: #1a1a2e; margin: 0 0 10px;">How was your food? ⭐</h3>
            <p style="color: #666; font-size: 14px; margin-bottom: 25px;">Your feedback helps us provide the best street food experience in Chennai. Please take a moment to rate us!</p>
            <a href="${getFrontendUrl()}/feedback/${order.id}" 
               style="background: #FF6B35; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
              Share Your Feedback
            </a>
          </div>
          ` : ''}

          <div style="margin-top: 30px; text-align: center; color: #888; font-size: 12px;">
            <p>Thank you for choosing Zing Bites!</p>
          </div>
        </div>
        ${brandFooter}
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
}

async function sendFeedbackRequestEmail(email, name, order) {
  const feedbackLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/feedback/${order.id}`;
  const mailOptions = {
    from: `"Zing Bites 🚚" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `⭐ How was your Zing Bites experience? (#${order.order_number})`,
    html: `
      <div style="max-width: 550px; margin: 0 auto; font-family: Arial, sans-serif; background: #f9f9f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        ${brandHeader}
        <div style="background: white; padding: 35px; text-align: center;">
          <h2 style="color: #1a1a2e; margin: 0 0 10px;">We'd Love Your Feedback! ⭐</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Hi ${name}, we hope you enjoyed your recent order from Zing Bites!</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Your feedback helps us serve you better. Please take a moment to rate us.</p>
          
          <a href="${feedbackLink}" style="background: #FF6B35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 10px rgba(255, 107, 53, 0.3);">Share Your Feedback</a>
          
          <p style="color: #888; font-size: 12px; margin-top: 30px;">Order Reference: #${order.order_number}</p>
        </div>
        ${brandFooter}
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
}

async function sendAdminReplyEmail(email, name, originalComment, reply) {
  const mailOptions = {
    from: `"Zing Bites 🚚" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `📨 New Message from Zing Bites!`,
    html: `
      <div style="max-width: 550px; margin: 0 auto; font-family: Arial, sans-serif; background: #f9f9f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        ${brandHeader}
        <div style="background: white; padding: 35px;">
          <h2 style="color: #1a1a2e; margin: 0 0 10px;">Hi ${name}! 👋</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Our team has responded to your recent feedback:</p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF6B35;">
            <p style="color: #888; font-size: 12px; margin: 0 0 10px; font-weight: bold; text-transform: uppercase;">Your Feedback:</p>
            <p style="color: #666; margin: 0; font-style: italic;">"${originalComment}"</p>
          </div>
          
          <div style="background: #e3f2fd; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #1a1a2e;">
            <p style="color: #1a1a2e; font-size: 12px; margin: 0 0 10px; font-weight: bold; text-transform: uppercase;">Zing Bites Reply:</p>
            <p style="color: #1a1a2e; margin: 0; line-height: 1.6;">${reply}</p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">Thank you for your valuable feedback!</p>
        </div>
        ${brandFooter}
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { 
  sendOTPEmail, 
  sendOrderConfirmationEmail, 
  sendContactNotification,
  sendOrderStatusUpdateEmail,
  sendFeedbackRequestEmail,
  sendAdminReplyEmail
};
