# YouTube Assistant App

A Next.js application providing a landing page and OpenAI API proxy for the YouTube Assistant browser extension.

## Features

- 🎨 **Beautiful Landing Page** - Modern, responsive design showcasing the extension features
- 🔒 **Secure API Proxy** - OpenAI API proxy to keep your API keys secure
- 🚀 **Fast & Scalable** - Built with Next.js 15 and TypeScript
- 🎯 **CORS Enabled** - Configured for browser extension communication

## Quick Start

### Prerequisites

- Node.js 18.20 or higher
- pnpm (recommended) or npm
- OpenAI API key

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd youtube-assist-app
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Next.js Configuration (optional)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### OpenAI Proxy

**Endpoint:** `POST /api/openai`

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Summarize this video transcript..."
    }
  ],
  "model": "gpt-3.5-turbo",
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": "Generated summary...",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── openai/
│   │       └── route.ts          # OpenAI API proxy
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable components
└── lib/                         # Utility functions
```

## Configuration

### CORS Settings

The API proxy is configured to accept requests from:
- Chrome extensions (`chrome-extension://*`)
- Firefox extensions (`moz-extension://*`)
- Local development (`http://localhost:3000`)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `NEXTAUTH_URL` | NextAuth.js URL | No |
| `NEXTAUTH_SECRET` | NextAuth.js secret | No |

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Adding New Features

1. **New API Routes:** Add files in `src/app/api/`
2. **New Pages:** Add files in `src/app/`
3. **Components:** Add reusable components in `src/components/`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Security Considerations

- ✅ API keys are stored server-side only
- ✅ CORS is properly configured for extensions
- ✅ Input validation on all API endpoints
- ✅ Error handling without exposing sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue on GitHub or contact the development team.
