module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'react-app',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  plugins: ['react', 'react-hooks'],
  rules: {
    // aquí tus reglas personalizadas, si las hay
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
