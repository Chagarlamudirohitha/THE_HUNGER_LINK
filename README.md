# Food Donation App

A web application that connects food donors with NGOs to reduce food waste and help those in need.

## Features

- User authentication for donors and NGOs
- Real-time donation tracking
- Chat system between donors and NGOs
- Notification system for updates
- Interactive dashboard for both donors and NGOs
- Location-based donation matching

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: JSON file-based storage
- Real-time: Socket.IO
- UI: Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
PORT=5000
VITE_API_URL=http://localhost:5000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 