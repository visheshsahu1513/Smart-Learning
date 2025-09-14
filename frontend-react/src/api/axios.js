// In src/api/axios.js
import axios from 'axios';

// --- DIAGNOSTIC LOG ---
const fastApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
console.log("DIAGNOSTIC [axios.js]: Creating apiFastAPI client with baseURL:", fastApiBaseUrl);

export const apiFastAPI = axios.create({
  baseURL: fastApiBaseUrl,
});

// --- DIAGNOSTIC LOG ---
const springBootBaseUrl = import.meta.env.VITE_SPRING_BOOT_API_BASE_URL || 'http://localhost:8082';
console.log("DIAGNOSTIC [axios.js]: Creating apiSpringBoot client with baseURL:", springBootBaseUrl);

export const apiSpringBoot = axios.create({
  baseURL: springBootBaseUrl,
});




// import axios from 'axios';

// // --- FastAPI Client ---
// // This client is already correct.
// export const apiFastAPI = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:8001/api',
// });


// // --- Spring Boot Client ---
// // --- THIS IS THE FIX ---
// // It now also uses an environment variable for its URL.
// export const apiSpringBoot = axios.create({
//   baseURL: import.meta.env.VITE_SPRING_BOOT_API_BASE_URL || 'https://localhost:8082',
// });