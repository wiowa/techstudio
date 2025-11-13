const { join } = require('path');

// Note: If you use library-specific PostCSS/Tailwind configuration then you should remove the `postcssConfig` build
// option from your application's configuration (i.e. project.json).
//
// See: https://nx.dev/guides/using-tailwind-css-in-react#step-4:-applying-configuration-to-libraries

module.exports = {
  plugins: {
    'postcss-import': {
      resolve: (id) => {
        // Resolve @wiowa-tech-studio/ui alias for CSS imports
        if (id.startsWith('@wiowa-tech-studio/ui/')) {
          const path = id.replace('@wiowa-tech-studio/ui/', '');
          return join(__dirname, '../../libs/shared/ui/src/', path);
        }
        return id;
      },
    },
    tailwindcss: {
      config: join(__dirname, 'tailwind.config.js'),
    },
    autoprefixer: {},
  },
};
