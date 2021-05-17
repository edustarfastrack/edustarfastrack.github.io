module.exports = {
  purge: [ './src/**/*.html',
  './src/**/*.js',],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily:{
        'Display':['PT Sans'],
        'body':['Roboto']
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
