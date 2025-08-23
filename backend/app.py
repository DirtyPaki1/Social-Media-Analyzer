import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Enable CORS with more specific settings
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# Load keys from environment
TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")  # Get from https://newsapi.org/

TWITTER_URL = "https://api.twitter.com/2/tweets/search/recent"
NEWSAPI_URL = "https://newsapi.org/v2/everything"

# Simple cache to avoid hitting rate limits for repeated queries
query_cache = {}
CACHE_DURATION = 300  # 5 minutes

# SVG-based placeholder images to avoid SSL certificate issues
def create_placeholder_svg(text, bg_color="666666", text_color="ffffff"):
    return f"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='#{bg_color}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#{text_color}' font-family='Arial, sans-serif' font-size='20'>{text}</text></svg>"

PROFILE_PLACEHOLDER = create_placeholder_svg("U", "666666", "ffffff")
IMAGE_PLACEHOLDER = create_placeholder_svg("No Image", "666666", "ffffff")

# Mock data for when APIs fail or aren't configured
MOCK_TWEETS = [
    {
        "id": "1",
        "text": "This is a sample tweet showing how the application works when Twitter API limits are reached.",
        "user": {
            "name": "Demo User",
            "username": "demo_user",
            "profile_image_url": PROFILE_PLACEHOLDER
        },
        "images": [
            create_placeholder_svg("Tweet Image 1", "0088cc", "ffffff")
        ]
    },
    {
        "id": "2",
        "text": "Another example tweet with an image to demonstrate the interface design.",
        "user": {
            "name": "Test Account",
            "username": "test_account",
            "profile_image_url": PROFILE_PLACEHOLDER
        },
        "images": [
            create_placeholder_svg("Tweet Image 2", "cc0000", "ffffff")
        ]
    }
]

MOCK_ARTICLES = [
    {
        "title": "Sample News Article 1",
        "description": "This is a demonstration article showing how news content appears in the application.",
        "url": "https://example.com/article1",
        "urlToImage": create_placeholder_svg("News 1", "00cc88", "ffffff"),
        "source": "Example News",
        "publishedAt": datetime.now().isoformat()
    },
    {
        "title": "Sample News Article 2",
        "description": "Another example article to showcase the news section of the search application.",
        "url": "https://example.com/article2",
        "urlToImage": create_placeholder_svg("News 2", "8800cc", "ffffff"),
        "source": "Demo Times",
        "publishedAt": datetime.now().isoformat()
    }
]

@app.route("/api/search", methods=["POST", "OPTIONS"])
def search():
    # Handle preflight requests
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    
    try:
        data = request.get_json()
        if not data or "query" not in data:
            return jsonify({"error": "Missing 'query' in request"}), 400

        query = data["query"]
        
        # Check cache first
        current_time = time.time()
        cache_key = f"{query}_{current_time // CACHE_DURATION}"
        if cache_key in query_cache:
            print(f"Returning cached results for: {query}")
            response = jsonify(query_cache[cache_key])
            return _corsify_actual_response(response), 200

        # -------- Twitter API --------
        twitter_data = []
        twitter_error = ""
        
        if TWITTER_BEARER_TOKEN:
            twitter_headers = {"Authorization": f"Bearer {TWITTER_BEARER_TOKEN}"}
            twitter_params = {
                "query": f"{query} has:images",  # Only get tweets with images
                "tweet.fields": "author_id,created_at,text,attachments",
                "expansions": "attachments.media_keys,author_id",
                "media.fields": "url,preview_image_url,type",
                "user.fields": "name,username,profile_image_url",
                "max_results": 10,
            }
            
            try:
                twitter_res = requests.get(TWITTER_URL, headers=twitter_headers, params=twitter_params, timeout=10)
                
                if twitter_res.status_code == 200:
                    data = twitter_res.json()
                    tweets = data.get("data", [])
                    users = {user["id"]: user for user in data.get("includes", {}).get("users", [])}
                    media = data.get("includes", {}).get("media", [])
                    
                    media_dict = {}
                    if media:
                        for item in media:
                            media_dict[item["media_key"]] = item
                    
                    for tweet in tweets:
                        tweet_images = []
                        user_info = users.get(tweet.get("author_id", ""), {})
                        
                        # Extract images from media attachments
                        if "attachments" in tweet:
                            media_keys = tweet["attachments"].get("media_keys", [])
                            for key in media_keys:
                                if key in media_dict and media_dict[key]["type"] == "photo":
                                    image_url = media_dict[key].get("url", "")
                                    if image_url:
                                        tweet_images.append(image_url)
                        
                        # If no images found, use placeholder
                        if not tweet_images:
                            tweet_images = [IMAGE_PLACEHOLDER]
                        
                        twitter_data.append({
                            "id": tweet.get("id", ""),
                            "text": tweet.get("text", ""),
                            "created_at": tweet.get("created_at", ""),
                            "user": {
                                "name": user_info.get("name", "Unknown User"),
                                "username": user_info.get("username", "unknown"),
                                "profile_image_url": user_info.get("profile_image_url", PROFILE_PLACEHOLDER)
                            },
                            "images": tweet_images
                        })
                elif twitter_res.status_code == 429:
                    twitter_error = "Twitter API rate limit exceeded. Using demo data."
                    twitter_data = MOCK_TWEETS
                else:
                    twitter_error = f"Twitter API error. Using demo data."
                    twitter_data = MOCK_TWEETS
                    print(f"Twitter API error: {twitter_res.status_code}, {twitter_res.text}")
                    
            except requests.exceptions.Timeout:
                twitter_error = "Twitter API request timed out. Using demo data."
                twitter_data = MOCK_TWEETS
            except requests.exceptions.RequestException as e:
                twitter_error = f"Twitter error. Using demo data."
                twitter_data = MOCK_TWEETS
                print(f"Twitter request exception: {str(e)}")
        else:
            twitter_error = "Twitter bearer token not configured. Using demo data."
            twitter_data = MOCK_TWEETS

        # -------- News API --------
        news_data = []
        news_error = ""
        
        if NEWSAPI_KEY and NEWSAPI_KEY != "your_actual_newsapi_key_here":
            news_params = {
                "q": query,
                "apiKey": NEWSAPI_KEY,
                "pageSize": 5,
                "sortBy": "publishedAt",
                "language": "en"
            }
            
            try:
                news_res = requests.get(NEWSAPI_URL, params=news_params, timeout=10)
                
                if news_res.status_code == 200:
                    news_json = news_res.json()
                    articles = news_json.get("articles", [])
                    for article in articles:
                        # Extract source name properly
                        source = article.get("source", {})
                        source_name = source.get("name", "Unknown Source") if isinstance(source, dict) else str(source)
                        
                        news_data.append({
                            "title": article.get("title", "No title"),
                            "description": article.get("description", "No description"),
                            "url": article.get("url", "#"),
                            "urlToImage": article.get("urlToImage", IMAGE_PLACEHOLDER),
                            "source": source_name,  # Now this is always a string
                            "publishedAt": article.get("publishedAt", "")
                        })
                else:
                    news_error = f"News API error (Status: {news_res.status_code}). Using demo data."
                    news_data = MOCK_ARTICLES
                    print(f"News API error: {news_res.status_code}, {news_res.text}")
                    
            except requests.exceptions.Timeout:
                news_error = "News API request timed out. Using demo data."
                news_data = MOCK_ARTICLES
            except requests.exceptions.RequestException as e:
                news_error = f"News API error: {str(e)}. Using demo data."
                news_data = MOCK_ARTICLES
                print(f"News request exception: {str(e)}")
        else:
            news_error = "News API key not configured. Using demo data."
            news_data = MOCK_ARTICLES

        # Prepare response
        response_data = {
            "tweets": twitter_data,
            "articles": news_data,
            "twitter_error": twitter_error,
            "news_error": news_error,
            "cached": False
        }
        
        # Cache the results
        query_cache[cache_key] = response_data
        
        response = jsonify(response_data)
        return _corsify_actual_response(response), 200

    except Exception as e:
        print(f"Server error: {str(e)}")
        # Return mock data on error
        response_data = {
            "tweets": MOCK_TWEETS,
            "articles": MOCK_ARTICLES,
            "error": f"Server error: {str(e)}",
            "cached": False
        }
        response = jsonify(response_data)
        return _corsify_actual_response(response), 200

def _build_cors_preflight_response():
    response = jsonify()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

if __name__ == "__main__":
    print("Starting server...")
    print(f"Twitter Bearer Token: {'Configured' if TWITTER_BEARER_TOKEN else 'Not configured'}")
    print(f"NewsAPI Key: {'Configured' if NEWSAPI_KEY and NEWSAPI_KEY != 'your_actual_newsapi_key_here' else 'Not configured'}")
    app.run(debug=True, port=5000)


    