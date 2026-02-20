/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // When someone scans the QR code
        source: '/fill/:id',
        // Send them to your actual code folder
        destination: '/surveys/:id',
      },
    ];
  },
};

export default nextConfig;