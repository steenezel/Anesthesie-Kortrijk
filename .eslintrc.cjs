module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true 
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    // Waarschuwing in plaats van fout bij ongebruikte variabelen (voorkomt build-crash tijdens dev)
    '@typescript-eslint/no-unused-vars': ['warn'],
    
    // Specifieke regel voor Vite om snelle refresh te garanderen
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    // React 19 heeft geen 'import React' meer nodig in elk bestand
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
  },
}