const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    const wasmExtensionRegExp = /\.wasm$/;
    config.resolve.extensions.push('.wasm');

    for (const rule of config.module.rules)
      for (const { loader, exclude } of rule.oneOf || [])
        if (loader?.includes('file-loader')) exclude.push(wasmExtensionRegExp);

    config.module.rules.push({
      test: wasmExtensionRegExp,
      include: path.resolve(__dirname, 'src'),
      type: 'javascript/auto',
      use: [{ loader: 'wasm-loader' }],
    });

    return config;
  },
};

module.exports = nextConfig;
