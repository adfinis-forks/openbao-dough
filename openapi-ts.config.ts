import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './api/oapi.yaml',
  output: './src/shared/client',
  plugins: ['@hey-api/client-fetch', '@tanstack/react-query'],
});
