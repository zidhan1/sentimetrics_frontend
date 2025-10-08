// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Jika menggunakan App Router
  experimental: {
    appDir: true,
  },

  // Konfigurasi untuk mengatasi CORS (jika diperlukan)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

// ==========================================
// .env.local (buat file ini di root project)
// ==========================================
/*
NEXT_PUBLIC_API_URL=http://localhost:5000
*/

// ==========================================
// Alternatif: Gunakan environment variable
// utils/api.ts
// ==========================================
/*
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const loginUser = async (brand: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Jika menggunakan cookies
    body: JSON.stringify({ brand, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  return response.json();
};
*/