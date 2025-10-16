import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { tanstackRouter } from '@tanstack/router-plugin/rspack';

export default defineConfig({
  plugins: [pluginReact(), pluginSvgr()],
  tools: {
    rspack: {
      plugins: [
        tanstackRouter({
          target: 'react',
          autoCodeSplitting: true,
          generatedRouteTree: './src/app/routeTree.gen.ts',
        }),
      ],
    },
  },
  resolve: {
    alias: {
      '@': './src',
      '@common': './src/shared/components/common',
      '@layout': './src/shared/components/layout',
      '@public': './public',
      '@icons': './src/shared/assets/icons',
    },
  },
  html: {
    template: './src/index.html',
  },
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
  output: {
    distPath: {
      root: 'dist',
    },
  },
  server: {
    historyApiFallback: true,
    proxy: {
      '/v1': {
        target: process.env.BAO_ADDR || 'http://localhost:8200',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
    },
  },
});
