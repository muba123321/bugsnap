# BugSnap 🐛

AI-powered bug report generator. Describe a bug in plain English — BugSnap turns it into a clean, structured report instantly.

## Tech Stack
- React 18
- Vite
- Anthropic Claude API

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Add your API key
Open the `.env` file and replace the placeholder with your real Anthropic API key:
```
VITE_ANTHROPIC_API_KEY=your_api_key_here
```
Get your key at: https://console.anthropic.com

### 3. Run locally
```bash
npm run dev
```
Visit http://localhost:3000

### 4. Build for production
```bash
npm run build
```

## Project Structure
```
BugSnap/
├── src/
│   ├── App.jsx        # Main app component
│   └── main.jsx       # React entry point
├── public/            # Static assets
├── index.html         # HTML entry point
├── vite.config.js     # Vite config
├── package.json       # Dependencies
└── .env               # API key (never commit this)
```

## Deploying to Vercel
1. Push to GitHub
2. Go to vercel.com → Import project
3. Add `VITE_ANTHROPIC_API_KEY` as an environment variable
4. Deploy!
