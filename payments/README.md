# Simple Chat UI

A simple chat interface built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- Clean, modern chat interface
- Real-time message display
- Responsive design
- TypeScript support
- Tailwind CSS styling
- API route for chat functionality

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
payments/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts    # Chat API endpoint
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Main page
│   └── components/
│       ├── ChatInterface.tsx    # Main chat component
│       ├── ChatInput.tsx        # Input component
│       └── ChatMessage.tsx      # Message component
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Customization

- **Styling**: Modify `src/app/globals.css` and `tailwind.config.js`
- **API Integration**: Update `src/app/api/chat/route.ts` to connect to your AI service
- **Components**: Customize components in `src/components/`

## Integration with AI Services

To connect with your AI service (like the agent framework), update the API route in `src/app/api/chat/route.ts`:

```typescript
// Replace the demo response with actual API call
const response = await fetch('http://localhost:8080/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, sessionId: 'default' })
})
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
