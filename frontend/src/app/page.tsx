"use client";

import { useState } from "react";

interface User {
  name: string;
  username: string;
  profile_image_url: string;
}

interface Tweet {
  id: string;
  text: string;
  user: User;
  images: string[];
  created_at?: string;
}

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: string | { name: string }; // Source can be string or object
  publishedAt: string;
}

interface Results {
  tweets: Tweet[];
  articles: Article[];
  twitter_error?: string;
  news_error?: string;
  cached?: boolean;
}

// SVG-based placeholder images to avoid SSL certificate issues
const createPlaceholderSVG = (text: string, bgColor: string = "666666", textColor: string = "ffffff") => {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="#${bgColor}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#${textColor}" font-family="Arial, sans-serif" font-size="20">${encodeURIComponent(text)}</text></svg>`;
};

const PROFILE_PLACEHOLDER = createPlaceholderSVG("U", "666666", "ffffff");
const IMAGE_PLACEHOLDER = createPlaceholderSVG("No Image", "666666", "ffffff");
const ERROR_PLACEHOLDER = createPlaceholderSVG("Image Error", "666666", "ffffff");

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>({ tweets: [], articles: [] });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [cached, setCached] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setErrors([]);
    setCached(false);
    try {
      const res = await fetch("http://localhost:5000/api/search", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ query: query.trim() }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setResults({
        tweets: data.tweets || [],
        articles: data.articles || [],
      });
      
      setCached(data.cached || false);
      
      // Collect errors
      const newErrors = [];
      if (data.twitter_error) newErrors.push(data.twitter_error);
      if (data.news_error) newErrors.push(data.news_error);
      if (data.error) newErrors.push(data.error);
      setErrors(newErrors);
      
    } catch (err) {
      console.error("Search error:", err);
      setErrors(["Failed to fetch results. Make sure the backend server is running on port 5000."]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "";
    }
  };

  // Helper function to get source name from article
  const getSourceName = (source: string | { name: string }): string => {
    if (typeof source === 'string') {
      return source;
    } else if (source && typeof source === 'object' && 'name' in source) {
      return source.name;
    }
    return "Unknown Source";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Social Media & News Search</h1>
      
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Note:</p>
        <p>If API keys aren't configured, demo data will be shown. For full functionality:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Get Twitter API keys from developer.twitter.com</li>
          <li>Get NewsAPI key from newsapi.org (free tier available)</li>
        </ul>
      </div>

      <div className="flex mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for tweets and news..."
          className="flex-1 border p-2 rounded mr-2"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.map((error, index) => (
            <p key={index} className="mb-1 last:mb-0">{error}</p>
          ))}
        </div>
      )}
      
      {cached && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Showing cached results from previous search
        </div>
      )}

      {/* Tweets Section */}
      {(results.tweets && results.tweets.length > 0) && (
        <>
          <h2 className="text-2xl font-semibold mb-4 mt-8">Tweets</h2>
          <div className="grid gap-4 mb-8">
            {results.tweets.map((tweet) => (
              <div
                key={`tweet-${tweet.id}`}
                className="p-4 border rounded shadow hover:bg-gray-50 transition"
              >
                <div className="flex items-center mb-3">
                  <img 
                    src={tweet.user?.profile_image_url || PROFILE_PLACEHOLDER} 
                    alt={tweet.user?.name || "User"}
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) => {
                      e.currentTarget.src = PROFILE_PLACEHOLDER;
                    }}
                  />
                  <div>
                    <p className="font-semibold">{tweet.user?.name || "Unknown User"}</p>
                    <p className="text-gray-500">@{tweet.user?.username || "unknown"}</p>
                  </div>
                </div>
                
                <p className="mb-3">{tweet.text}</p>
                
                {tweet.images && tweet.images.length > 0 && (
                  <div className={`grid gap-2 ${tweet.images.length > 1 ? 'grid-cols-2' : ''}`}>
                    {tweet.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt="Tweet media"
                        className="rounded-lg w-full h-auto"
                        onError={(e) => {
                          e.currentTarget.src = ERROR_PLACEHOLDER;
                        }}
                      />
                    ))}
                  </div>
                )}
                
                {tweet.created_at && (
                  <p className="text-gray-500 text-sm mt-2">
                    {formatDate(tweet.created_at)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Articles Section */}
      {(results.articles && results.articles.length > 0) && (
        <>
          <h2 className="text-2xl font-semibold mb-4">News Articles</h2>
          <div className="grid gap-6">
            {results.articles.map((article, index) => (
              <div
                key={`article-${article.url}-${index}`}
                className="p-4 border rounded shadow hover:bg-gray-50 transition"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {article.urlToImage && (
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full md:w-48 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = IMAGE_PLACEHOLDER;
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-lg text-blue-600 hover:underline"
                    >
                      {article.title}
                    </a>
                    <p className="text-gray-500 text-sm mt-1">
                      {getSourceName(article.source)}
                    </p>
                    <p className="my-2">{article.description}</p>
                    {article.publishedAt && (
                      <p className="text-gray-500 text-sm">
                        {formatDate(article.publishedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {((!results.tweets || results.tweets.length === 0) && 
        (!results.articles || results.articles.length === 0) && !loading) && (
        <div className="text-center text-gray-500 py-8">
          No results found. Try searching for something else.
        </div>
      )}
    </div>
  );
}