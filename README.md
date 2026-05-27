# DineQ — Real-Time Restaurant Queue & Pre-Order System

A full-stack web application enabling customers to join virtual restaurant queues remotely, pre-order food while waiting, and receive real-time table notifications. Features an AI-powered wait-time predictor using Google Gemini API that analyzes queue patterns, party sizes, and peak-hour demand to deliver confidence-scored estimates with natural language reasoning.

## Tech Stack

**Frontend:**
- React.js with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Socket.io-client for real-time updates
- React Hot Toast for notifications

**Backend:**
- Node.js with Express.js
- Supabase (PostgreSQL) for database
- Socket.io for real-time communication
- JWT for authentication
- bcryptjs for password hashing

**AI:**
- Google Gemini API (gemini-2.0-flash)
- @google/generative-ai SDK

**Database:**
- PostgreSQL via Supabase
- Row Level Security (RLS) enabled

## Features

### Customer App
- View restaurant information and current status
- Join virtual queue with token generation
- Real-time queue position tracking
- AI-powered wait time predictions
- Pre-order food while waiting
- Live notifications when table is ready

### Admin Dashboard
- Secure JWT authentication
- Real-time queue management
- Seat or remove customers
- Update order status
- Menu management (CRUD operations)
- AI wait predictions for queue management

### AI Wait-Time Predictor
- Analyzes queue length, party sizes, table availability
- Considers time of day, day of week
- Factors in pre-orders for faster seating
- Provides confidence scores and reasoning
- 2-minute result caching
- Automatic fallback on API failure

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5000

# Supabase (get from your Supabase project settings)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# JWT
JWT_SECRET=your-jwt-secret-here

# Gemini AI (free at aistudio.google.com)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Getting API Keys

1. **Supabase:** Create a free project at [supabase.com](https://supabase.com)
   - Copy the Project URL and anon/public key from Settings > API

2. **Gemini API:** Get a free key at [aistudio.google.com](https://aistudio.google.com)
   - Create an API key and copy it

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies (already included in package.json)
```

### 2. Set Up Database

The application uses Supabase for the database. Run the migrations:

```bash
# The migrations are automatically applied when you set up the Supabase project
# or use the MCP tools to apply the migrations
```

### 3. Seed the Database

```bash
npm run seed
```

This will create:
- Restaurant information
- Admin user (admin@spicegarden.com / admin123)
- 10 menu items across 3 categories

### 4. Run the Application

**Development (both frontend and backend):**
```bash
npm run dev:all
```

**Or run separately:**
```bash
# Terminal 1 - Backend server
npm run dev:server

# Terminal 2 - Frontend dev server
npm run dev
```

### 5. Access the Application

- **Customer App:** http://localhost:5173
- **Admin Dashboard:** http://localhost:5173/admin/login

## AI Wait-Time Prediction System

The AI predictor uses Google Gemini API to provide intelligent wait estimates:

### How It Works

1. **Data Collection:**
   - Current queue length
   - Party sizes in queue
   - Available tables
   - Current time and day of week
   - Number of pre-orders

2. **Analysis:**
   - Dinner hours (6PM-10PM) are considered busier
   - Weekends have higher traffic
   - Larger parties take longer to seat
   - Pre-order customers get 10-15% faster seating

3. **Prediction Output:**
   - Estimated wait in minutes
   - Wait range (e.g., "15-25 minutes")
   - Confidence level (high/medium/low)
   - Natural language reasoning
   - Peak hour warning flag

### Caching

- Predictions are cached for 2 minutes
- Cache invalidates automatically on queue changes
- Reduces API calls and improves performance

### Fallback

If Gemini API fails, the system uses a fallback formula:
```javascript
estimatedWait = Math.ceil((queueLength * 35) / availableTables)
```

## API Endpoints

### Public Endpoints
- `GET /api/restaurant` - Restaurant info + queue length + latest AI prediction
- `POST /api/queue/join` - Join queue (returns token + position + wait estimate)
- `GET /api/queue/status/:token` - Current position + status + wait estimate
- `GET /api/menu` - Full menu grouped by category
- `POST /api/orders` - Place pre-order
- `GET /api/ai/predict-wait` - AI wait prediction (cached)

### Admin Endpoints (JWT Required)
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/admin/queue` - Full queue list
- `PATCH /api/admin/queue/:id/seat` - Seat customer
- `DELETE /api/admin/queue/:id` - Remove customer
- `GET /api/admin/orders` - All orders
- `PATCH /api/admin/orders/:id/status` - Update order status
- `POST /api/menu` - Add menu item
- `PATCH /api/menu/:id` - Edit menu item
- `DELETE /api/menu/:id` - Delete menu item

## Database Schema

### Tables
- `restaurants` - Restaurant settings
- `customers` - Queue entries with tokens
- `menu_items` - Restaurant menu
- `orders` - Pre-orders
- `order_items` - Items within orders
- `admins` - Admin authentication
- `wait_predictions` - AI prediction cache

## Future Improvements

- **Menu Recommendation Chatbot:** AI-powered dish suggestions based on preferences
- **Sentiment Analysis:** Analyze customer feedback and reviews
- **Multi-Restaurant Support:** Support multiple restaurants with separate queues
- **Reservation System:** Book tables in advance
- **SMS/Email Notifications:** Alert customers via SMS or email
- **Analytics Dashboard:** Detailed insights on peak hours, popularity, etc.
- **Loyalty Program:** Rewards for frequent customers

## Project Structure

```
/dineq
├── server/
│   ├── controllers/       # API controllers
│   ├── middleware/        # Auth middleware
│   ├── routes/            # Express routes
│   ├── services/          # AI service
│   ├── prisma/            # Schema and seed
│   └── server.js          # Express + Socket.io
├── src/
│   ├── components/        # React components
│   ├── context/           # Auth context
│   ├── hooks/             # Custom hooks
│   ├── pages/
│   │   ├── admin/         # Admin pages
│   │   └── ...            # Customer pages
│   └── services/          # API services
├── .env.example           # Environment template
└── README.md              # This file
```

## License

MIT License - Free to use for personal and commercial projects.

---

Built with ❤️ for portfolio demonstration

