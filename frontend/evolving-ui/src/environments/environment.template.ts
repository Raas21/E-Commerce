//template file for environment files

export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080', //back-end api base url
    groqApiUrl: 'https://api.groq.com/v1/suggestions', // Groq API endpoint
    groqApiKey: 'your-groq-api-key-here', // Replace with your actual Groq API key
    logLevel: 'debug' //Optional: reduce logging in production
  };