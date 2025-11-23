# 🎤 AI Interview Bot

> An intelligent, voice-powered interview platform using Next.js, Web Speech API, Deepgram TTS, and Google Gemini AI

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Features

- 🎙️ **Real-time Speech Recognition** - Browser-native Web Speech API
- 🔊 **Natural Voice Responses** - Powered by Deepgram TTS
- 🤖 **Intelligent Conversations** - Google Gemini AI conducts the interview
- 🎨 **Modern UI** - Sleek corporate design with animated voice visualizer
- 💬 **Context-Aware** - AI maintains conversation history for natural flow
- 📱 **Responsive** - Works seamlessly on desktop and mobile browsers

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- API Keys for:
  - [Deepgram](https://console.deepgram.com) (for TTS)
  - [Google Gemini](https://aistudio.google.com/app/apikey) (for AI)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Swarno-Coder/AI-INTERVIEWER.git
cd AI-INTERVIEWER
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key
GEMINI_API_KEY=your_gemini_api_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

## 🎯 How It Works

1. **Start Interview** → AI greets you with voice
2. **Click Microphone** → Begin speaking (browser's speech recognition)
3. **AI Listens** → Your speech is transcribed in real-time
4. **Send Response** → Click "Send Now" or stop mic to submit
5. **AI Responds** → Gemini processes and replies with voice + text
6. **Repeat** → Natural conversation flow until interview ends

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Web Speech API** | Browser-native speech recognition |
| **Deepgram** | High-quality text-to-speech |
| **Google Gemini** | AI-powered conversation |
| **Canvas API** | Voice visualizer animation |

## 📁 Project Structure

```
AI-INTERVIEWER/
├── app/
│   ├── api/
│   │   ├── interview/route.ts    # Gemini AI endpoint
│   │   └── tts/route.ts          # Deepgram TTS endpoint
│   ├── page.tsx                  # Main interview UI
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   └── VoiceBubble.tsx           # Animated visualizer
├── hooks/
│   └── useInterview.ts           # Interview logic
├── .env.local                    # Environment variables (create this)
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## 🎨 Customization

### Change AI Interviewer Personality

Edit `app/api/interview/route.ts`:

```typescript
const SYSTEM_MESSAGE = `You are a professional AI interviewer...`;
```

### Modify Voice Style

Edit `app/api/tts/route.ts`:

```typescript
model: 'aura-asteria-en', // Options: aura-luna-en, aura-stella-en, etc.
```

### Update UI Colors

Edit `tailwind.config.js` or modify classes in `app/page.tsx`

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_DEEPGRAM_API_KEY`
   - `GEMINI_API_KEY`
4. Deploy!

### Deploy to Render

1. Create new Web Service on [Render](https://render.com)
2. Connect GitHub repository
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables
6. Deploy!

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| No speech recognition | Use Chrome/Edge/Safari browser with HTTPS |
| No voice playback | Check Deepgram API key and browser audio permissions |
| AI not responding | Verify Gemini API key in `.env.local` |
| Build errors | Ensure Node.js 18+ and run `npm install` |

## 📄 API Endpoints

### `POST /api/interview`
Processes user input with conversation history, returns AI response

**Request:**
```json
{
  "conversationHistory": [
    {"role": "user", "content": "I'm a software engineer..."}
  ]
}
```

**Response:**
```json
{
  "reply": "Great! Tell me about your experience...",
  "shouldEnd": false
}
```

### `POST /api/tts`
Converts text to speech using Deepgram

**Request:**
```json
{
  "text": "Hello, welcome to your interview."
}
```

**Response:** Audio WAV file (binary)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Deepgram](https://deepgram.com/) - Voice AI platform  
- [Google Gemini](https://ai.google.dev/) - Generative AI
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

## 📧 Contact

For questions or support, please open an issue on [GitHub](https://github.com/Swarno-Coder/AI-INTERVIEWER/issues).

---

**Built with ❤️ by [Swarno-Coder](https://github.com/Swarno-Coder)**
