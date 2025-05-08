require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add CORS headers for static files
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});

// Initialize bot with token from environment variable
let bot = null;

async function initializeBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not set in environment variables');
    return;
  }

  try {
    bot = new TelegramBot(token, { polling: true });
    await setupBotHandlers();
    console.log('Bot initialized successfully');
  } catch (error) {
    console.error('Error initializing bot:', error);
    bot = null;
  }
}

async function setupBotHandlers() {
  // Start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const keyboard = await getKeyboardLayout();

    try {
      // Get start message settings
      const startMessage = await prisma.startMessageSettings.findFirst({
        where: { id: 1 }
      });

      if (!startMessage) {
        // If no settings exist, create default settings
        const defaultSettings = await prisma.startMessageSettings.create({
          data: {
            id: 1,
            text: 'Добро пожаловать! Выберите действие:',
            image: null
          }
        });
        startMessage = defaultSettings;
      }

      // First send the welcome message with image if exists
      if (startMessage.image) {
        const imagePath = path.join(__dirname, startMessage.image);
        if (fs.existsSync(imagePath)) {
          await bot.sendPhoto(chatId, imagePath, {
            caption: startMessage.text,
            reply_markup: keyboard
          });
        } else {
          // If image is missing, send just the text
          await bot.sendMessage(chatId, startMessage.text, {
            reply_markup: keyboard
          });
        }
      } else {
        await bot.sendMessage(chatId, startMessage.text, {
          reply_markup: keyboard
        });
      }
    } catch (error) {
      console.error('Error sending start message:', error);
      // Fallback to default message
      await bot.sendMessage(chatId, 'Добро пожаловать! Выберите действие:', {
        reply_markup: keyboard
      });
    }
  });

  // Handle callback queries (button clicks)
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === 'catalog') {
      try {
        // Answer the callback query to remove the loading state
        await bot.answerCallbackQuery(callbackQuery.id);

        const posts = await prisma.post.findMany({
          orderBy: {
            createdAt: 'desc'
          }
        });

        if (posts.length === 0) {
          return bot.sendMessage(chatId, 'Каталог пока пуст.');
        }

        // Send a message before sending posts
        await bot.sendMessage(chatId, 'Вот все доступные товары:');

        // Get keyboard layout for buttons
        const keyboard = await getKeyboardLayout();

        // Send each post as a separate message
        for (const post of posts) {
          try {
            const imagePath = path.join(__dirname, post.image);
            if (fs.existsSync(imagePath)) {
              await bot.sendPhoto(chatId, imagePath, {
                caption: post.description,
                reply_markup: keyboard
              });
            } else {
              // If image is missing, send just the description
              await bot.sendMessage(chatId, post.description, {
                reply_markup: keyboard
              });
            }
          } catch (error) {
            console.error(`Error sending post ${post.id}:`, error);
            // Continue with next post even if one fails
            continue;
          }
        }
      } catch (error) {
        console.error('Error sending catalog:', error);
        bot.sendMessage(chatId, 'Произошла ошибка при загрузке каталога.');
      }
    }
  });

  // Handle regular messages
  bot.on('message', async (msg) => {
    if (msg.text.startsWith('/')) return; // Ignore commands

    const chatId = msg.chat.id;
    const content = msg.text;
    const telegramId = msg.from.id.toString();

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId }
      });

      if (!user) {
        return bot.sendMessage(chatId, 'Please use /start command first to register.');
      }

      await prisma.message.create({
        data: {
          content,
          userId: user.id
        }
      });

      bot.sendMessage(chatId, 'Message saved successfully!');
    } catch (error) {
      console.error('Error saving message:', error);
      bot.sendMessage(chatId, 'Sorry, there was an error saving your message.');
    }
  });
}

// Initialize bot on startup
async function initializeBotOnStartup() {
  await initializeBot();
}

// API Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { messages: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      include: { user: true }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Button Settings API Routes
app.get('/api/buttons', async (req, res) => {
  try {
    const buttons = await prisma.buttonSettings.findMany({
      orderBy: {
        order: 'asc'
      }
    });
    res.json(buttons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/buttons', async (req, res) => {
  try {
    const { name, type, value, order } = req.body;
    const button = await prisma.buttonSettings.create({
      data: {
        name,
        type,
        value,
        order
      }
    });
    res.json(button);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/buttons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, value, order } = req.body;
    const button = await prisma.buttonSettings.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        value,
        order
      }
    });
    res.json(button);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/buttons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.buttonSettings.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Button deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get keyboard layout
async function getKeyboardLayout() {
  const buttons = await prisma.buttonSettings.findMany({
    orderBy: {
      order: 'asc'
    }
  });

  const keyboard = [];
  let currentRow = [];

  buttons.forEach((button, index) => {
    const buttonConfig = {
      text: button.name,
      [button.type === 'url' ? 'url' : 'callback_data']: button.value
    };

    // Add emoji based on button type
    if (button.type === 'url') {
      buttonConfig.text = '🔗 ' + buttonConfig.text;
    } else if (button.value === 'catalog') {
      buttonConfig.text = '📋 ' + buttonConfig.text;
    }

    // Make each button take full width
    keyboard.push([buttonConfig]);
  });

  return { inline_keyboard: keyboard };
}

// Post Management API Routes
app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { description } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const post = await prisma.post.create({
      data: {
        image: imageUrl,
        description
      }
    });

    res.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Delete the image file
    const imagePath = path.join(__dirname, post.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await prisma.post.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get start message settings
app.get('/api/start-message', async (req, res) => {
  try {
    const settings = await prisma.startMessageSettings.findFirst({
      where: { id: 1 }
    });

    if (!settings) {
      // If no settings exist, create default settings
      const defaultSettings = await prisma.startMessageSettings.create({
        data: {
          id: 1,
          text: 'Добро пожаловать! Выберите действие:',
          image: null
        }
      });
      return res.json(defaultSettings);
    }

    res.json(settings);
  } catch (error) {
    console.error('Error getting start message settings:', error);
    res.status(500).json({ error: 'Failed to get start message settings' });
  }
});

// Update start message settings
app.put('/api/start-message', async (req, res) => {
  try {
    const { text, image } = req.body;
    const settings = await prisma.startMessageSettings.upsert({
      where: { id: 1 },
      update: { text, image },
      create: { id: 1, text, image }
    });
    res.json(settings);
  } catch (error) {
    console.error('Error updating start message settings:', error);
    res.status(500).json({ error: 'Failed to update start message settings' });
  }
});

// Upload image for start message
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Start server and initialize bot
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await initializeBotOnStartup();
}); 