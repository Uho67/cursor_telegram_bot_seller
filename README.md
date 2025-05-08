# Aroma with Image Bot

A Telegram bot application with a Vue.js frontend dashboard for managing aromas and images. This application allows users to interact with a Telegram bot to manage and share aroma-related content with images.

## Features

- Telegram bot integration for aroma management
- Vue.js dashboard for content administration
- Image upload and management
- Database storage with PostgreSQL
- RESTful API backend
- Real-time updates

## Project Structure

```
aroma_with_image_bot/
├── backend/               # Node.js backend server
│   ├── src/              # Source code
│   ├── prisma/           # Database schema and migrations
│   └── uploads/          # Image upload directory
└── frontend/             # Vue.js frontend application
    ├── src/              # Source code
    ├── public/           # Static assets
    └── dist/             # Production build output
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher) or yarn (v1.22 or higher)
- PostgreSQL (v12 or higher)
- Telegram Bot Token (from [BotFather](https://t.me/botfather))
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/aroma_with_image_bot.git
cd aroma_with_image_bot
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
   
   # Telegram Bot Configuration
   TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Optional: File Upload Configuration
   MAX_FILE_SIZE=5242880  # 5MB in bytes
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif
   ```

4. Set up the database:
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate

   # (Optional) Seed the database with initial data
   npm run prisma:seed
   ```

5. Start the backend server:
   ```bash
   # Development mode with hot reload
   npm run dev

   # Production mode
   npm start
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```env
   # API Configuration
   VITE_API_URL="http://localhost:3000"
   
   # Optional: Feature Flags
   VITE_ENABLE_ANALYTICS=false
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Development

### Local Development

- Backend runs on `http://localhost:3000` by default
- Frontend development server runs on `http://localhost:5173` by default
- The frontend will proxy API requests to the backend during development
- Hot reload is enabled for both frontend and backend

### API Documentation

The backend API documentation is available at `http://localhost:3000/api-docs` when running in development mode.

### Database Management

- Use Prisma Studio to manage your database:
  ```bash
  cd backend
  npx prisma studio
  ```

### Environment Variables

#### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| TELEGRAM_BOT_TOKEN | Telegram bot token | - |
| PORT | Server port | 3000 |
| NODE_ENV | Environment mode | development |
| MAX_FILE_SIZE | Maximum file upload size | 5242880 |
| ALLOWED_FILE_TYPES | Allowed file types | image/jpeg,image/png,image/gif |

#### Frontend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:3000 |
| VITE_ENABLE_ANALYTICS | Enable analytics | false |

## Production Deployment

### Backend Deployment

1. Set up a production environment:
   ```bash
   cd backend
   npm install --production
   ```

2. Configure production environment variables

3. Build and start the server:
   ```bash
   npm start
   ```

### Frontend Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the contents of `frontend/dist` to your web server

3. Configure your web server to handle client-side routing

## Available Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start the development server with hot reload |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed the database with initial data |
| `npm run test` | Run tests |
| `npm run lint` | Run linting |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run tests |
| `npm run lint` | Run linting |

## Dependencies

### Backend
- Express.js - Web framework
- Prisma - Database ORM
- node-telegram-bot-api - Telegram bot integration
- cors - Cross-origin resource sharing
- multer - File upload handling
- dotenv - Environment variable management
- winston - Logging

### Frontend
- Vue.js 3 - Frontend framework
- Vue Router - Routing
- Axios - HTTP client
- Vite - Build tool and development server
- Pinia - State management
- Vue I18n - Internationalization

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database exists

2. **Telegram Bot Not Responding**
   - Verify TELEGRAM_BOT_TOKEN
   - Check bot permissions
   - Ensure backend is running

3. **Image Upload Failures**
   - Check file size limits
   - Verify allowed file types
   - Ensure upload directory exists

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Use conventional commits

## License

This project is licensed under the ISC License.

## Support

For support, please:
1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/yourusername/aroma_with_image_bot/issues)
3. Create a new issue if needed 