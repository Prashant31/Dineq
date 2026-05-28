# DineQ — Real-Time Restaurant Queue & Pre-Order System

A full-stack web application that solves the problem of unpredictable restaurant wait times. Customers can join virtual queues remotely, track their position in real-time, pre-order food while waiting, and receive instant notifications when their table is ready — eliminating the need to physically wait at the restaurant.

## Problem Statement

Customers visiting popular restaurants during peak hours face 30-60 minute waits without knowing exact wait times. This app provides real-time queue visibility, remote queue joining, and AI-powered wait-time predictions so diners can make informed decisions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, Prisma ORM |
| Real-time | Socket.io (WebSockets) |
| Authentication | JWT (JSON Web Tokens) |
| AI | Groq API (LLaMA 3.3 70B) |
| Password Hashing | bcryptjs |

## Features

### Customer Side
- Join virtual queue remotely with a unique token (e.g. `SG-042`)
- Real-time queue position tracking via WebSocket
- AI-powered wait-time prediction with confidence scoring and natural language reasoning
- Browse full menu while waiting in queue
- Pre-order food before being seated
- Instant toast notification when table is ready

### Admin Dashboard
- Secure login with JWT authentication
- Live queue management — seat or remove customers in real time
- AI wait-time predictor visible at dashboard level
- Order management — update status (Pending → Preparing → Ready)
- Full menu CRUD — add, edit, delete dishes

### AI Wait-Time Predictor
- Powered by Groq API using LLaMA 3.3 70B model
- Analyzes: queue length, party sizes, available tables, time of day, day of week, pre-order count
- Returns: estimated wait range, confidence level (high/medium/low), natural language reasoning, peak hour warning
- 10-minute in-memory cache to minimize API calls
- Automatic fallback formula if API is unavailable

## Project Structure

```
/dineq
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── queueController.js
│   │   ├── menuController.js
│   │   ├── ordersController.js
│   │   ├── restaurantController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── queue.js
│   │   ├── menu.js
│   │   ├── orders.js
│   │   ├── restaurant.js
│   │   └── ai.js
│   ├── services/
│   │   └── aiService.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── server.js
├── src/
│   ├── components/
│   │   ├── QueueCard.tsx
│   │   ├── MenuCard.tsx
│   │   ├── AdminTable.tsx
│   │   └── ToastNotification.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── useSocket.js
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Menu.tsx
│   │   ├── Queue.tsx
│   │   └── admin/
│   │       ├── Login.tsx
│   │       ├── Dashboard.tsx
│   │       └── MenuManager.tsx
│   └── services/
│       └── api.ts
├── .env.example
└── README.md
```

## Database Schema

- **Restaurant** — name, timings, total tables, open/closed status
- **Customer** — name, phone, party size, queue token, position, status
- **MenuItem** — name, description, price, category, availability
- **Order** — linked to customer, total amount, status
- **OrderItem** — linked to order and menu item, quantity, price
- **Admin** — email, bcrypt password hash
- **WaitPrediction** — AI prediction logs with confidence and reasoning

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurant` | Restaurant info + queue length + AI prediction |
| POST | `/api/queue/join` | Join queue — returns token + position + wait estimate |
| GET | `/api/queue/status/:token` | Current position and status |
| GET | `/api/menu` | Full menu grouped by category |
| POST | `/api/orders` | Place pre-order linked to queue token |
| POST | `/api/ai/predict-wait` | Get AI wait prediction (cached 10 min) |

### Admin (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login — returns JWT |
| GET | `/api/admin/queue` | Full waiting queue |
| PATCH | `/api/admin/queue/:id/seat` | Seat a customer |
| DELETE | `/api/admin/queue/:id` | Remove customer from queue |
| GET | `/api/admin/orders` | All pre-orders |
| PATCH | `/api/admin/orders/:id/status` | Update order status |
| POST | `/api/menu` | Add menu item |
| PATCH | `/api/menu/:id` | Edit menu item |
| DELETE | `/api/menu/:id` | Delete menu item |

## Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/Prashant31/Dineq.git
cd Dineq
```

**2. Install dependencies**
```bash
npm install
cd server && npm install && cd ..
```

**3. Create `.env` file in the root folder**
```
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/dineq
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key_here
```

Get a free Groq API key at: https://console.groq.com (no credit card required)

**4. Create the database**
```bash
psql -U postgres -c "CREATE DATABASE dineq;"
```

**5. Run migrations and seed data**
```bash
cd server
npx prisma migrate dev --name init
node prisma/seed.js
cd ..
```

**6. Start the application**
```bash
npm run dev:all
```

**7. Open in browser**
- Customer App: http://localhost:5173
- Admin Dashboard: http://localhost:5173/admin/login
- Admin credentials: `admin@spicegarden.com` / `admin123`

## How the AI Prediction Works

Every time the queue changes (someone joins, gets seated, or is removed), the app calls the Groq API with the following context:

```json
{
  "queueLength": 4,
  "partySizes": [2, 3, 1, 4],
  "availableTables": 7,
  "currentTime": "7:45 PM",
  "dayOfWeek": "Saturday",
  "preOrderCount": 2
}
```

The LLaMA 3.3 model applies restaurant-specific rules (peak hours, weekend traffic, party size impact) and returns a structured JSON prediction with wait range, confidence level, and human-readable reasoning.

Results are cached for 10 minutes to reduce API usage. If the API fails, a mathematical fallback kicks in automatically.

## Future Improvements

- **Menu recommendation chatbot** — AI suggests dishes based on dietary preferences
- **Sentiment analysis** — Analyze customer feedback after dining
- **Multi-restaurant support** — Platform for multiple restaurants
- **SMS/Email notifications** — Alert customers when table is near ready
- **Analytics dashboard** — Peak hour trends, popular dishes, average wait times
- **Reservation system** — Book tables in advance

## License

MIT License — Free to use for personal and commercial projects.