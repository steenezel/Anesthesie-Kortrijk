module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', '**/ui/*.tsx'], 
  parser: '@typescript-eslint/parser',
  plugins: [], // We laten dit volledig LEEG om fouten te vermijden
  rules: {
    // We laten 'any' toe voor de medische data
    '@typescript-eslint/no-explicit-any': 'off',
    
    // Ongebruikte variabelen en andere kleine zaken zijn enkel waarschuwingen
    '@typescript-eslint/no-unused-vars': 'warn',
    'prefer-const': 'warn',
    'react-hooks/exhaustive-deps': 'warn'
  },
}