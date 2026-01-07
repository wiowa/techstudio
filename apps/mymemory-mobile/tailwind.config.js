const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('../../libs/shared/ui/tailwind.config.js')],
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    join(__dirname, '../../libs/shared/ui/src/**/*.{ts,tsx}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
};
