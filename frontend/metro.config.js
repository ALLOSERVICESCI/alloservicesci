const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Reduce the number of workers to decrease resource usage
config.maxWorkers = 2;

// Configuration pour les extensions spécifiques à la plateforme
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.tsx', 'web.ts', 'web.jsx', 'web.js'];

module.exports = config;
