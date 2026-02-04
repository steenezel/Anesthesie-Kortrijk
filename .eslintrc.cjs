module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', '**/ui/*.tsx'], // We negeren de UI-componenten (Shadcn)
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    // We zetten de crashende regel uit
    'react-refresh/only-export-components': 'off',
    
    // We laten 'any' toe (gebeurt vaak bij medische calculators/data)
    '@typescript-eslint/no-explicit-any': 'off',
    
    // Ongebruikte variabelen zijn een waarschuwing, geen blokkade
    '@typescript-eslint/no-unused-vars': 'warn',
    
    // Andere kleine irritaties omzetten naar waarschuwingen
    'prefer-const': 'warn',
    'react-hooks/exhaustive-deps': 'warn'
  },
}