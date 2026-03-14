// API Base URL config
// In development (npm run dev): Vite proxy handles /api/* → localhost:5000 or Render
// In production (built bundle): must use the absolute Render URL since there is no proxy
export const API_BASE = import.meta.env.VITE_API_URL
    || (import.meta.env.DEV ? '' : 'https://votechain-hackathon-project-ymy1.onrender.com');
