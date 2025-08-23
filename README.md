# Social Media Analyzer

A full-stack web application that allows users to search for and analyze social media content and news articles in real-time. Built with React/Next.js frontend and Flask Python backend.

## Features

- **Twitter Search**: Search for recent tweets with images using the Twitter API
- **News Integration**: Find relevant news articles using NewsAPI
- **Image Support**: View images attached to tweets and news articles
- **Real-time Results**: Get up-to-date social media and news content
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Graceful fallback to demo data when APIs are unavailable

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Flask** - Python web framework
- **Python Requests** - HTTP client for API calls
- **Flask-CORS** - Cross-origin resource sharing

### APIs
- **Twitter API v2** - For fetching tweets and images
- **NewsAPI** - For fetching news articles

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Twitter Developer Account
- NewsAPI Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DirtyPaki1/Social-Media-Analyzer.git
   cd Social-Media-Analyzer
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
   NEWSAPI_KEY=your_newsapi_key_here
   ```

### API Keys Setup

1. **Twitter API**
   - Visit [developer.twitter.com](https://developer.twitter.com)
   - Create a developer account and project
   - Generate a Bearer Token
   - Add it to your `.env` file

2. **NewsAPI**
   - Visit [newsapi.org](https://newsapi.org)
   - Register for a free account
   - Get your API key
   - Add it to your `.env` file

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py
   ```
   Server will run on http://localhost:5000

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Application will be available at http://localhost:3000

## Project Structure

```
Social-Media-Analyzer/
├── backend/
│   ├── app.py                 # Flask application
│   ├── requirements.txt       # Python dependencies
│   └── .env                  # Environment variables
├── frontend/
│   ├── app/
│   │   └── page.tsx          # Main search page
│   ├── package.json          # Node.js dependencies
│   └── tailwind.config.js    # Tailwind CSS configuration
└── README.md
```

## Usage

1. Open the application in your browser
2. Enter a search query in the input field
3. Click "Search" or press Enter
4. View tweets with images and related news articles
5. Click on news articles to read the full story

## API Rate Limits

- **Twitter API**: Free tier has limited requests (450 requests/15 minutes)
- **NewsAPI**: Free tier allows 100 requests/day
- The application includes caching to minimize API calls
- Demo data is shown when API limits are exceeded

## Error Handling

The application includes comprehensive error handling:
- API rate limit detection
- Network timeout handling
- Fallback to demo data
- User-friendly error messages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend is running on port 5000
2. **API Errors**: Check your API keys are valid and have not exceeded limits
3. **Build Errors**: Make sure you have the correct Node.js and Python versions

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Verify your API keys are correctly set
3. Ensure both frontend and backend servers are running

## Future Enhancements

- [ ] User authentication
- [ ] Search history
- [ ] Advanced filters (date range, language, etc.)
- [ ] Sentiment analysis
- [ ] Social media analytics dashboard
- [ ] Export functionality
- [ ] Mobile app version

## Acknowledgments

- [Twitter API](https://developer.twitter.com) for social media data
- [NewsAPI](https://newsapi.org) for news content
- [Next.js](https://nextjs.org) and [Flask](https://flask.palletsprojects.com) teams