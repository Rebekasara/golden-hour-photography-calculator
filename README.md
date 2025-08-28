# Golden Hour Calculator 🌅

A beautiful Next.js application for calculating golden hour times for photographers. Features location search, interactive maps, weather integration, and photography inspiration.

## ✨ Features

- **Golden Hour Calculations**: Precise sunrise, sunset, and golden hour times for any location
- **Interactive Maps**: Visual location selection with map integration
- **Weather Integration**: Real-time weather data from OpenWeatherMap
- **Photography Inspiration**: Beautiful images from Unsplash and Pexels
- **Location Search**: Advanced search with autocomplete and suggestions
- **Responsive Design**: Beautiful UI that works on all devices
- **Performance Optimized**: Fast loading with image optimization
- **SEO Friendly**: Optimized for search engines

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- API keys for external services (see Environment Variables)

### Installation

```bash
# Clone the repository
git clone https://github.com/Rebekasara/golden-hour-photography-calculator.git
cd golden-hour-photography-calculator

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Add your API keys to .env file
# See Environment Variables section below

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🌍 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database (optional - uses SQLite by default)
DATABASE_URL="file:./dev.db"

# Authentication (required for user features)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Weather API (required)
NEXT_PUBLIC_OPENWEATHER_API_KEY="your-openweather-api-key"

# Image APIs (optional but recommended)
UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
UNSPLASH_APPLICATION_ID="your-unsplash-app-id"
UNSPLASH_SECRET_KEY="your-unsplash-secret"
PEXELS_API_KEY="your-pexels-api-key"
```

### Getting API Keys

- **OpenWeatherMap**: [Sign up here](https://openweathermap.org/api)
- **Unsplash**: [Create an app here](https://unsplash.com/developers)
- **Pexels**: [Get API key here](https://www.pexels.com/api/)

## 📦 Deployment

This application is optimized for deployment on Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Rebekasara/golden-hour-photography-calculator)

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Maps**: Leaflet with React Leaflet
- **Database**: Prisma with SQLite/PostgreSQL
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   └── types/               # TypeScript types
├── components/              # Shared UI components
├── public/                  # Static assets
├── prisma/                  # Database schema
└── styles/                  # Global styles
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SunCalc](https://github.com/mourner/suncalc) for sun position calculations
- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [Unsplash](https://unsplash.com/) and [Pexels](https://pexels.com/) for beautiful photography
- [Radix UI](https://radix-ui.com/) for accessible UI components

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ for photographers around the world 📸