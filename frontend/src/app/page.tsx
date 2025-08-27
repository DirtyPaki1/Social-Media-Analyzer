// src/app/page.tsx (frontend)
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
      // Use relative path for API calls in production, or full path for development
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/search' 
        : '/api/search';
      
      const response = await fetch(apiUrl, {
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
      setError("Failed to connect to the server. Please make sure the backend is running.");
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-800">Social Media Analyzer</h1>
        <p className="text-lg text-gray-600 text-center mb-8">Search for trending topics across Twitter and news sources</p>

        <div className="flex flex-col sm:flex-row mb-8 gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a topic, keyword, or hashtag..."
            className="flex-1 border-2 border-gray-300 p-4 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : "Search"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <strong>Error: </strong> {error}
            </div>
            <p className="mt-2 text-sm">Make sure your backend server is running and your API keys are configured.</p>
          </div>
        )}

        {/* Tweets Section */}
        {results.tweets.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.503 14-14v-.617c.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/>
              </svg>
              Latest Tweets
            </h2>
            <div className="space-y-6">
              {results.tweets.map((tweet) => (
                <div key={tweet.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-start mb-4">
                    <img
                      src={tweet.user.profile_image_url}
                      alt={tweet.user.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{tweet.user.name}</p>
                      <p className="text-gray-500">@{tweet.user.username}</p>
                    </div>
                  </div>
                  <p className="mb-4 text-gray-800">{tweet.text}</p>
                  {tweet.images && tweet.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {tweet.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt="Tweet content"
                          className="rounded-lg w-full h-auto object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Articles Section */}
        {results.articles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
              <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
              </svg>
              News Articles
            </h2>
            <div className="space-y-6">
              {results.articles.map((article, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex flex-col md:flex-row gap-6">
                    {article.urlToImage && article.urlToImage !== "https://via.placeholder.com/400x200" && (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full md:w-48 h-40 object-cover rounded-xl"
                      />
                    )}
                    <div className="flex-1">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {article.title}
                      </a>
                      <p className="text-gray-600 mt-3">{article.description}</p>
                      <div className="flex flex-wrap justify-between items-center mt-4">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {article.source}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.tweets.length === 0 && results.articles.length === 0 && query && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-xl font-semibold text-gray-700">No results found</h3>
            <p className="text-gray-500 mt-2">We couldn't find any results for "{query}". Try a different search term.</p>
          </div>
        )}

        {!loading && !query && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <svg className="w-16 h-16 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <h3 className="text-xl font-semibold text-gray-700">Ready to explore</h3>
            <p className="text-gray-500 mt-2">Enter a search term above to find tweets and news articles.</p>
          </div>
        )}
      </div>
    </div>
  );
}