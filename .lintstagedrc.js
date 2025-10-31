module.exports = {
  // Type check TypeScript files
  '**/*.{ts,tsx}': () => 'npm run type-check',

  // Lint & format TypeScript and JavaScript files
  '**/*.{ts,tsx,js,jsx}': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
  ],

  // Format other files
  '**/*.{json,md,mdx,css,html,yml,yaml}': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
  ],
}
