# Iris AI Assistant

A modern, browser-based conversational AI assistant built with Flask and OpenAI's GPT-3.5.

## Features

- Natural language conversation with AI
- Markdown-formatted responses
- Clean, modern chat interface
- Conversation history tracking
- Error handling and fallbacks
- Code block formatting
- New chat functionality

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Flask, Python
- **AI**: OpenAI GPT-3.5 Turbo
- **Markdown**: marked.js
- **Icons**: Font Awesome

## Project Structure

```
iris/
├── backend/         # Flask server and API handlers
├── frontend/        # Static web assets
├── templates/       # HTML templates
├── static/          # Compiled static files
└── requirements.txt # Python dependencies
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_key_here
   ```
4. Run the development server:
   ```bash
   python app.py
   ```

## Development

The project uses Flask for the backend API and vanilla JavaScript for the frontend. Responses are formatted using marked.js for Markdown support.

## License

MIT