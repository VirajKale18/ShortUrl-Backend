const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;
const startTime = Date.now();

// Middleware
app.use(cors({
  origin:'*'
}));
app.use(express.json());
// app.use(express.static(path.join(__dirname, '../client/dist')));

// Helper function to generate random short code
function generateShortCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Health check endpoint
app.get('/healthz', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    ok: true,
    version: '1.0',
    uptime
  });
});

// API Routes

// POST /api/links - Create a new short link
app.post('/api/links', async (req, res) => {
  try {
    const { longUrl, shortCode } = req.body;

    // Validate URL
    if (!longUrl) {
      return res.status(400).json({ error: 'longUrl is required' });
    }

    if (!isValidUrl(longUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Generate or use provided short code
    let code = shortCode;
    if (!code) {
      // Generate unique code
      let attempts = 0;
      do {
        code = generateShortCode(Math.floor(Math.random() * 3) + 6); // 6-8 chars
        const existing = await prisma.link.findUnique({
          where: { shortCode: code }
        });
        if (!existing) break;
        attempts++;
        if (attempts > 10) {
          code = generateShortCode(8);
        }
      } while (attempts < 20);
    } else {
      // Validate short code format
      if (!/^[A-Za-z0-9]{1,20}$/.test(code)) {
        return res.status(400).json({ 
          error: 'Short code must contain only alphanumeric characters (max 20 chars)' 
        });
      }

      // Check if code already exists
      const existing = await prisma.link.findUnique({
        where: { shortCode: code }
      });

      if (existing) {
        return res.status(409).json({ error: 'Short code already exists' });
      }
    }

    // Create the link
    const link = await prisma.link.create({
      data: {
        shortCode: code,
        longUrl
      }
    });

    res.status(201).json(link);
  } catch (error) {
    console.error('Error creating link:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Short code already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/links - List all links
app.get('/api/links', async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/links/:code - Get stats for a specific link
app.get('/api/links/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const link = await prisma.link.findUnique({
      where: { shortCode: code }
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(link);
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/links/:code - Delete a link
app.delete('/api/links/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const link = await prisma.link.findUnique({
      where: { shortCode: code }
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    await prisma.link.delete({
      where: { shortCode: code }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:code - Redirect route
app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Skip if it's a known route
    if (['api', 'healthz', 'code'].includes(code)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const link = await prisma.link.findUnique({
      where: { shortCode: code }
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Update click count and last clicked
    await prisma.link.update({
      where: { shortCode: code },
      data: {
        clickCount: { increment: 1 },
        lastClicked: new Date()
      }
    });

    // Redirect
    res.redirect(302, link.longUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve React app for all other routes
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/dist/index.html'));
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

