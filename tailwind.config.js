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
     width: {
      "101":"30rem",
      "110":"36rem",
      "120":"40rem"
      },
      height: {
        "101":"30rem",
        "105":"33.5rem",
        "110":"36rem",
        "120":"40rem"
        }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
