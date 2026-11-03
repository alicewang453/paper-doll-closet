import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// The site is served from https://alicewang453.github.io/paper-doll-closet/
export default defineConfig({
  base: '/paper-doll-closet/',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
