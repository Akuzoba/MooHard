# StudyVerse

An intelligent study assistant powered by AI that helps you create study materials from your documents.

## Features

- **PDF Upload & Processing**: Upload PDF documents and extract text content
- **AI-Powered Study Tools**:
  - 📝 **Smart Summaries**: Get concise summaries of key concepts
  - 🧠 **Quiz Generation**: Automatically generate multiple-choice questions
  - 💡 **Flashcards**: Create study flashcards for better retention
  - 💬 **Document Chat**: Ask questions about your uploaded documents
  - 📋 **Notes**: Take and organize your study notes

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **AI**: Google Genkit with Gemini 1.5 Flash
- **PDF Processing**: PDF-parse library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google AI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd StudyVerse
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```bash
GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Setup

### Getting Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env.local` file

## Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── views/          # Feature-specific views
│   └── layout/         # Layout components
├── ai/                 # AI integration
│   ├── flows/          # Genkit flows for AI operations
│   └── genkit.ts       # Genkit configuration
├── hooks/              # Custom React hooks
└── lib/                # Utility functions and types
```

## Usage

1. **Upload a PDF**: Click the upload area to select and upload a PDF document
2. **Generate Study Materials**: The app automatically creates summaries, quizzes, and flashcards
3. **Study**: Use the tabs to navigate between different study materials
4. **Chat**: Ask questions about your document in the chat view
5. **Take Notes**: Use the notes section to add your own insights

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.
