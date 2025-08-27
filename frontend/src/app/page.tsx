"use client";

import { useState } from "react";

interface Tweet {
  id: string;
  text: string;
  user: {
    name: string;
    username: string;
    profile_image_url: string;
  };
  images: string[];
}

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: string;
  publishedAt: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ tweets: Tweet[], articles: Article[] }>({ tweets: [], articles: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    try {
      // Update this URL to your deployed backend URL
      const response = await fetch("https://your-backend-domain.vercel.app/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || "Failed to fetch results");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to connect to the server");
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Social Media & News Search</h1>

      <div className="flex mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter search term..."
          className="flex-1 border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="ml-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Tweets Section */}
      {results.tweets.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tweets</h2>
          <div className="space-y-4">
            {results.tweets.map((tweet) => (
              <div key={tweet.id} className="p-4 border rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <img
                    src={tweet.user.profile_image_url}
                    alt={tweet.user.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold">{tweet.user.name}</p>
                    <p className="text-gray-500">@{tweet.user.username}</p>
                  </div>
                </div>
                <p className="mb-3">{tweet.text}</p>
                {tweet.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="Tweet content"
                    className="rounded-lg max-w-full h-auto"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles Section */}
      {results.articles.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">News Articles</h2>
          <div className="space-y-6">
            {results.articles.map((article, index) => (
              <div key={index} className="p-4 border rounded-lg shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full md:w-48 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-bold text-blue-600 hover:underline"
                    >
                      {article.title}
                    </a>
                    <p className="text-gray-600 mt-2">{article.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Source: {article.source}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.tweets.length === 0 && results.articles.length === 0 && query && (
        <div className="text-center text-gray-500 py-12">
          <p>No results found for "{query}". Try a different search term.</p>
        </div>
      )}

      {!loading && !query && (
        <div className="text-center text-gray-500 py-12">
          <p>Enter a search term to find tweets and news articles.</p>
        </div>
      )}
    </div>
  );
}