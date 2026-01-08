const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const postmark = require('postmark');

class EmailService {
	constructor() {
		this.fromEmail =
			process.env.EMAIL_FROM || 'noreply@positivepostcards.com';
		this.apiKey = process.env.POSTMARK_API_KEY;
		this.serverId = process.env.POSTMARK_SERVER_ID;
		this.isConfigured = !!this.apiKey;

		if (!this.isConfigured) {
			console.warn(
				'WARNING: Postmark API key not configured. Email sending will be disabled.'
			);
			this.client = null;
		} else {
			// Initialize Postmark client with API key
			this.client = new postmark.ServerClient(this.apiKey);
			console.log('✅ Postmark email service initialized');
		}
	}

	async sendMagicLink(email, magicLink) {
		if (!this.isConfigured) {
			console.log(`Demo magic link for ${email}: ${magicLink}`);
			return { demo: true, link: magicLink };
		}

		try {
			const result = await this.client.sendEmail({
				From: this.fromEmail,
				To: email,
				Subject: 'Your Positive Postcards Login Link',
				HtmlBody: `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Login to Positive Postcards</title>
						<style>
							body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
							.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
							.content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
							.button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
							.footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
							.expire-notice { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
						</style>
					</head>
					<body>
						<div class="header">
							<h1>🌟 Positive Postcards</h1>
							<p>Your login link is ready!</p>
						</div>
						<div class="content">
							<h2>Welcome back!</h2>
							<p>Click the button below to securely log into your Positive Postcards account and manage your subscription:</p>
							
							<div style="text-align: center;">
								<a href="${magicLink}" class="button">Access My Account</a>
							</div>
							
							<div class="expire-notice">
								<strong>⏰ This link expires in 15 minutes</strong> for your security. If it expires, simply request a new one.
							</div>
							
							<p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
							<p style="word-break: break-all; background: #e8e8e8; padding: 10px; border-radius: 4px; font-family: monospace;">
								${magicLink}
							</p>
							
							<p>If you didn't request this login link, you can safely ignore this email.</p>
						</div>
						<div class="footer">
							<p>© 2026 Positive Postcards. Spreading positivity, one postcard at a time.</p>
							<p>Questions? Reply to this email or visit our help center.</p>
						</div>
					</body>
					</html>
				`,
				TextBody: `
Welcome back to Positive Postcards!

Click this link to log into your account: ${magicLink}

This link expires in 15 minutes for your security.

If you didn't request this login link, you can safely ignore this email.

© 2026 Positive Postcards
				`,
				MessageStream: 'outbound',
			});

			console.log(
				`Magic link email sent to ${email}. Message ID: ${result.MessageID}`
			);
			return { success: true, messageId: result.MessageID };
		} catch (error) {
			console.error('Error sending magic link email:', error);
			throw error;
		}
	}

	async sendWelcomeEmail(email, subscriptionDetails) {
		if (!this.isConfigured) {
			console.log(`Demo welcome email for ${email}`);
			return { demo: true };
		}

		try {
			const result = await this.client.sendEmail({
				From: this.fromEmail,
				To: email,
				Subject: '🎉 Welcome to Positive Postcards!',
				HtmlBody: `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Welcome to Positive Postcards</title>
						<style>
							body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
							.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
							.content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
							.highlight { background: #e8f4f8; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
							.footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
						</style>
					</head>
					<body>
						<div class="header">
							<h1>🌟 Welcome to Positive Postcards!</h1>
							<p>Your journey to daily positivity starts now</p>
						</div>
						<div class="content">
							<h2>Thank you for subscribing! 💝</h2>
							<p>We're thrilled you've joined our community of positive thinkers. Your subscription is now active and your first postcard will be on its way soon!</p>
							
							<div class="highlight">
								<h3>What happens next?</h3>
								<ul>
									<li>📮 Your first postcard ships within 2-3 business days</li>
									<li>📬 Expect daily deliveries of uplifting messages</li>
									<li>💌 Each postcard features beautiful artwork and positive affirmations</li>
									<li>🔄 Manage your subscription anytime in your account dashboard</li>
								</ul>
							</div>
							
							<p><strong>Subscription Details:</strong></p>
							<ul>
								<li>Plan: ${subscriptionDetails.plan || 'Individual Subscription'}</li>
								<li>Billing: ${subscriptionDetails.billing || 'Monthly'}</li>
								<li>Start Date: ${new Date().toLocaleDateString()}</li>
							</ul>
							
							<p>Ready to spread even more positivity? Share Positive Postcards with friends and family!</p>
						</div>
						<div class="footer">
							<p>© 2026 Positive Postcards. Spreading positivity, one postcard at a time.</p>
							<p>Questions? Reply to this email - we'd love to hear from you!</p>
						</div>
					</body>
					</html>
				`,
				TextBody: `
Welcome to Positive Postcards! 🌟

Thank you for subscribing! Your journey to daily positivity starts now.

What happens next?
- Your first postcard ships within 2-3 business days
- Expect daily deliveries of uplifting messages  
- Each postcard features beautiful artwork and positive affirmations
- Manage your subscription anytime in your account dashboard

Subscription Details:
- Plan: ${subscriptionDetails.plan || 'Individual Subscription'}
- Billing: ${subscriptionDetails.billing || 'Monthly'}
- Start Date: ${new Date().toLocaleDateString()}

Ready to spread even more positivity? Share Positive Postcards with friends and family!

© 2026 Positive Postcards
Questions? Reply to this email - we'd love to hear from you!
				`,
				MessageStream: 'outbound',
			});

			console.log(
				`Welcome email sent to ${email}. Message ID: ${result.MessageID}`
			);
			return { success: true, messageId: result.MessageID };
		} catch (error) {
			console.error('Error sending welcome email:', error);
			throw error;
		}
	}

	async sendSubscriptionCancellationEmail(email, subscriptionDetails) {
		if (!this.isConfigured) {
			console.log(`Demo cancellation email for ${email}`);
			return { demo: true };
		}

		try {
			const result = await this.client.sendEmail({
				From: this.fromEmail,
				To: email,
				Subject: 'Your Positive Postcards Subscription',
				HtmlBody: `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Subscription Update</title>
						<style>
							body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
							.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
							.content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
							.highlight { background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
							.footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
						</style>
					</head>
					<body>
						<div class="header">
							<h1>🌟 Positive Postcards</h1>
							<p>Subscription Update</p>
						</div>
						<div class="content">
							<h2>We'll miss you! 💝</h2>
							<p>Your subscription has been scheduled for cancellation at the end of your current billing period.</p>
							
							<div class="highlight">
								<h3>Important Details:</h3>
								<ul>
									<li>📅 Your subscription remains active until: ${
										subscriptionDetails.endsAt ||
										'End of current period'
									}</li>
									<li>📮 You'll continue receiving postcards until then</li>
									<li>💳 No further charges will occur</li>
									<li>🔄 You can reactivate anytime before the end date</li>
								</ul>
							</div>
							
							<p>We hope Positive Postcards brought some joy to your days. If you'd like to share feedback about your experience, we'd love to hear from you!</p>
							
							<p>Want to come back? You can restart your subscription anytime by visiting our website.</p>
						</div>
						<div class="footer">
							<p>© 2026 Positive Postcards. Thank you for being part of our community.</p>
							<p>Questions? Reply to this email - we're here to help!</p>
						</div>
					</body>
					</html>
				`,
				TextBody: `
Positive Postcards - Subscription Update

We'll miss you!

Your subscription has been scheduled for cancellation at the end of your current billing period.

Important Details:
- Your subscription remains active until: ${
					subscriptionDetails.endsAt || 'End of current period'
				}
- You'll continue receiving postcards until then
- No further charges will occur  
- You can reactivate anytime before the end date

We hope Positive Postcards brought some joy to your days. If you'd like to share feedback, we'd love to hear from you!

Want to come back? You can restart your subscription anytime.

© 2026 Positive Postcards
Questions? Reply to this email - we're here to help!
				`,
				MessageStream: 'outbound',
			});

			console.log(
				`Cancellation email sent to ${email}. Message ID: ${result.MessageID}`
			);
			return { success: true, messageId: result.MessageID };
		} catch (error) {
			console.error('Error sending cancellation email:', error);
			throw error;
		}
	}

	async sendPaymentFailedEmail(email, subscriptionDetails) {
		if (!this.isConfigured) {
			console.log(`Demo payment failed email for ${email}`);
			return { demo: true };
		}

		try {
			const result = await this.client.sendEmail({
				From: this.fromEmail,
				To: email,
				Subject: '⚠️ Payment Issue - Positive Postcards',
				HtmlBody: `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Payment Issue</title>
						<style>
							body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
							.header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
							.content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
							.alert { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
							.button { display: inline-block; padding: 15px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
							.footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
						</style>
					</head>
					<body>
						<div class="header">
							<h1>⚠️ Payment Issue</h1>
							<p>Action required for your Positive Postcards subscription</p>
						</div>
						<div class="content">
							<h2>We couldn't process your payment</h2>
							<p>There was an issue processing your most recent payment for your Positive Postcards subscription.</p>
							
							<div class="alert">
								<strong>Don't worry!</strong> Your subscription is still active and we'll retry the payment. But to avoid any interruption in your daily postcards, please update your payment method.
							</div>
							
							<div style="text-align: center;">
								<a href="https://positivepostcards.com/login" class="button">Update Payment Method</a>
							</div>
							
							<h3>Next Steps:</h3>
							<ol>
								<li>Log into your account using the button above</li>
								<li>Go to your billing settings</li>
								<li>Update your payment method</li>
								<li>We'll automatically retry the payment</li>
							</ol>
							
							<p>If you continue to experience issues or have questions, please don't hesitate to reach out to our support team.</p>
						</div>
						<div class="footer">
							<p>© 2026 Positive Postcards. We're here to help!</p>
							<p>Questions? Reply to this email or contact support.</p>
						</div>
					</body>
					</html>
				`,
				TextBody: `
⚠️ Payment Issue - Positive Postcards

We couldn't process your payment for your Positive Postcards subscription.

Don't worry! Your subscription is still active and we'll retry the payment. But to avoid any interruption, please update your payment method.

Next Steps:
1. Log into your account at https://positivepostcards.com/login
2. Go to your billing settings  
3. Update your payment method
4. We'll automatically retry the payment

Questions? Reply to this email or contact support.

© 2026 Positive Postcards
				`,
				MessageStream: 'outbound',
			});

			console.log(
				`Payment failed email sent to ${email}. Message ID: ${result.MessageID}`
			);
			return { success: true, messageId: result.MessageID };
		} catch (error) {
			console.error('Error sending payment failed email:', error);
			throw error;
		}
	}

	// Test email functionality
	async sendTestEmail(email) {
		if (!this.isConfigured) {
			return { demo: true, message: 'Postmark not configured' };
		}

		try {
			const result = await this.client.sendEmail({
				From: this.fromEmail,
				To: email,
				Subject: 'Postmark Email Service Test - Positive Postcards',
				HtmlBody: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
						<h1 style="color: #667eea;">✅ Email Service Test</h1>
						<p>Congratulations! Your Postmark email service is working correctly for Positive Postcards.</p>
						<div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
							<h3>Configuration Details:</h3>
							<ul>
								<li><strong>From:</strong> ${this.fromEmail}</li>
								<li><strong>Service:</strong> Postmark</li>
								<li><strong>Server ID:</strong> ${this.serverId}</li>
								<li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
							</ul>
						</div>
						<p>Your email service is ready to send magic links, welcome emails, and other notifications!</p>
					</div>
				`,
				TextBody: `
✅ Email Service Test - Positive Postcards

Congratulations! Your Postmark email service is working correctly.

Configuration Details:
- From: ${this.fromEmail}
- Service: Postmark  
- Server ID: ${this.serverId}
- Test Time: ${new Date().toLocaleString()}

Your email service is ready to send magic links, welcome emails, and other notifications!
				`,
				MessageStream: 'outbound',
			});

			return { success: true, messageId: result.MessageID };
		} catch (error) {
			console.error('Error sending test email:', error);
			throw error;
		}
	}
}

module.exports = new EmailService();
