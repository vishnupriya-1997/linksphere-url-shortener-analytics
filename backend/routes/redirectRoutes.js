const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const Click = require('../models/Click');
const { parseRequestMetadata } = require('../utils/geoParser');
const { redirectLimiter } = require('../middlewares/rateLimiter');

router.get('/:shortCode', redirectLimiter, async (req, res, next) => {
  const { shortCode } = req.params;

  try {
    // 1. Transaction-safe atomic check and update of click count
    const link = await Link.findOneAndUpdate(
      { shortCode, isActive: true },
      { $inc: { totalClicks: 1 } },
      { new: true }
    );

    // 2. Return 404 if link not found or inactive
    if (!link) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Not Found - LinkSphere</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: grid; place-items: center; min-height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; text-align: center; max-width: 400px; border: 1px solid rgba(99, 102, 241, 0.15); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5); }
            h1 { color: #f43f5e; margin-top: 0; }
            p { color: #94a3b8; line-height: 1.6; }
            .btn { display: inline-block; margin-top: 1.5rem; background: #6366f1; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: bold; transition: background 0.2s; }
            .btn:hover { background: #4f46e5; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>404 Not Found</h1>
            <p>The shortened link you are trying to access is inactive, invalid, or does not exist on our servers.</p>
            <a href="/" class="btn">Create Your Own Short Link</a>
          </div>
        </body>
        </html>
      `);
    }

    // 3. Expiration date check logic
    if (link.expiresAt && new Date() > link.expiresAt) {
      link.isActive = false;
      await link.save();
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Expired - LinkSphere</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: grid; place-items: center; min-height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; text-align: center; max-width: 400px; border: 1px solid rgba(99, 102, 241, 0.15); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5); }
            h1 { color: #f59e0b; margin-top: 0; }
            p { color: #94a3b8; line-height: 1.6; }
            .btn { display: inline-block; margin-top: 1.5rem; background: #6366f1; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: bold; transition: background 0.2s; }
            .btn:hover { background: #4f46e5; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Link Expired</h1>
            <p>This tracking URL reached its scheduled expiration date and is no longer active.</p>
            <a href="/" class="btn">Create Your Own Short Link</a>
          </div>
        </body>
        </html>
      `);
    }

    // 4. Click limit checking logic
    if (link.clickLimit && link.totalClicks > link.clickLimit) {
      link.isActive = false;
      await link.save();
      return res.status(403).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Click Limit Reached - LinkSphere</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: grid; place-items: center; min-height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; text-align: center; max-width: 400px; border: 1px solid rgba(99, 102, 241, 0.15); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5); }
            h1 { color: #ef4444; margin-top: 0; }
            p { color: #94a3b8; line-height: 1.6; }
            .btn { display: inline-block; margin-top: 1.5rem; background: #6366f1; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: bold; transition: background 0.2s; }
            .btn:hover { background: #4f46e5; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Limit Reached</h1>
            <p>This tracking URL has reached its click volume limit and has been automatically deactivated.</p>
            <a href="/" class="btn">Create Your Own Short Link</a>
          </div>
        </body>
        </html>
      `);
    }

    // 5. Asynchronously log analytical request details
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const ua = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || 'Direct';

    // Parse metadata
    const meta = parseRequestMetadata(ip, ua);

    // Asynchronously log the click entry
    Click.create({
      linkId: link._id,
      ipAddress: ip,
      userAgent: ua,
      browser: meta.browser,
      os: meta.os,
      device: meta.device,
      country: meta.country,
      region: meta.region,
      city: meta.city,
      referrer
    }).catch(err => console.error('Error logging click statistics:', err.message));

    // 6. Direct HTTP 302 Redirection
    res.redirect(302, link.originalUrl);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
