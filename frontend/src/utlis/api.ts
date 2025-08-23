// src/utils/api.ts

export const analyzeTweets = async (query: string, count: number = 10) => {
    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, count }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }
  
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error; // Re-throw to let components handle it
    }
  };
  
  // Add other API calls here as needed
  export const checkHealth = async () => {
    const response = await fetch('http://localhost:5000/api/health');
    return await response.json();
  };