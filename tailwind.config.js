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
      "105":"33.5rem",
      "110":"36rem",
      "120":"40rem",
      "140":"60rem"
      },
      height: {
        "101":"30rem",
        "105":"33.5rem",
        "110":"36rem",
        "120":"40rem"
        },
      borderRadius:{
        "left":"5rem 2rem 5rem 2rem",
        "right":"2rem 5rem 2rem 5rem"
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
