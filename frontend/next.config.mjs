/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      domains: [
          'media.istockphoto.com',
          'lh3.googleusercontent.com',
          '127.0.0.1',
          'localhost',
      ], // Add the hostname here
  },
  webpack(config, { isServer }) {
      // Ensure videos are handled correctly with Webpack's built-in asset modules
      config.module.rules.push({
          test: /\.mp4$/,
          type: 'asset/resource',  // Use Webpack's native asset module
          generator: {
              filename: 'static/media/[name].[hash][ext][query]',  // Output path for video files
          },
      });

      return config;
  },
};

export default nextConfig;
