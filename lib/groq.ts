import Groq from "groq-sdk";

// Server-side only — never import this in client components
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;
