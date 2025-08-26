import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
from datetime import datetime

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load keys from environment
TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")

TWITTER_URL = "https://api.twitter.com/2/tweets/search/recent"
NEWSAPI_URL = "https://newsapi.org/v2/everything"

# Mock data
MOCK_TWEETS = [
    {
        "id": "1",
        "text": "This is sample tweet data. Configure API keys for real tweets.",
        "user": {
            "name": "Demo User",
            "username": "demo_user",
            "profile_image_url": "https://via.placeholder.com/50"
        },
        "images": ["https://via.placeholder.com/400x200"]
    }
]

MOCK_ARTICLES = [
    {
        "title": "Sample News Article",
        "description": "This is sample news data. Configure API keys for real articles.",
        "url": "#",
        "urlToImage": "https://via.placeholder.com/400x200",
        "source": "Demo News",
        "publishedAt": datetime.now().isoformat()
    }
]

@app.route("/api/search", methods=["POST"])
def search():
    try:
        data = request.get_json()
        if not data or "query" not in data:
            return jsonify({"error": "Missing query"}), 400

        query = data["query"]
        print(f"Searching for: {query}")

        # Get tweets
        twitter_data = []
        if TWITTER_BEARER_TOKEN and TWITTER_BEARER_TOKEN != "your_twitter_bearer_token_here":
            try:
                headers = {"Authorization": f"Bearer {TWITTER_BEARER_TOKEN}"}
                params = {
                    "query": query,
                    "tweet.fields": "author_id,created_at,text",
                    "max_results": 5,
                }
                response = requests.get(TWITTER_URL, headers=headers, params=params, timeout=10)
                
                if response.status_code == 200:
                    tweets = response.json().get("data", [])
                    twitter_data = [{
                        "id": t["id"],
                        "text": t["text"],
                        "user": {"name": "Twitter User", "username": "user", "profile_image_url": "https://via.placeholder.com/50"},
                        "images": ["https://via.placeholder.com/400x200"]
                    } for t in tweets]
                else:
                    twitter_data = MOCK_TWEETS
                    print(f"Twitter API error: {response.status_code}")
            except Exception as e:
                twitter_data = MOCK_TWEETS
                print(f"Twitter API exception: {str(e)}")
        else:
            twitter_data = MOCK_TWEETS
            print("Twitter bearer token not configured")

        # Get news articles
        news_data = []
        if NEWSAPI_KEY and NEWSAPI_KEY != "your_newsapi_key_here":
            try:
                params = {
                    "q": query,
                    "apiKey": NEWSAPI_KEY,
                    "pageSize": 5
                }
                response = requests.get(NEWSAPI_URL, params=params, timeout=10)
                
                if response.status_code == 200:
                    articles = response.json().get("articles", [])
                    news_data = [{
                        "title": a.get("title", "No title"),
                        "description": a.get("description", "No description"),
                        "url": a.get("url", "#"),
                        "urlToImage": a.get("urlToImage", "https://via.placeholder.com/400x200"),
                        "source": a.get("source", {}).get("name", "Unknown"),
                        "publishedAt": a.get("publishedAt", "")
                    } for a in articles]
                else:
                    news_data = MOCK_ARTICLES
                    print(f"News API error: {response.status_code}")
            except Exception as e:
                news_data = MOCK_ARTICLES
                print(f"News API exception: {str(e)}")
        else:
            news_data = MOCK_ARTICLES
            print("News API key not configured")

        return jsonify({
            "tweets": twitter_data,
            "articles": news_data
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "tweets": MOCK_TWEETS,
            "articles": MOCK_ARTICLES,
            "error": str(e)
        }), 200

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Server is running"}), 200

if __name__ == "__main__":
    print("=" * 50)
    print("Social Media Analyzer Backend Server")
    print("=" * 50)
    print(f"Twitter API: {'Configured' if TWITTER_BEARER_TOKEN and TWITTER_BEARER_TOKEN != 'your_twitter_bearer_token_here' else 'Not configured'}")
    print(f"NewsAPI: {'Configured' if NEWSAPI_KEY and NEWSAPI_KEY != 'your_newsapi_key_here' else 'Not configured'}")
    print("Server starting on http://0.0.0.0:5000")
    print("Available routes:")
    print("  POST /api/search - Search for tweets and news")
    print("  GET  /health     - Health check endpoint")
    print("=" * 50)
    app.run(debug=True, host="0.0.0.0", port=5000)