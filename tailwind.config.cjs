module.exports = {
  content: ["./index.html", "./main.ts", "./services/**/*.ts"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif']
      },
      colors: {
        aurora: '#faf9f6'
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
        'grid-size': '40px 40px'
      }
    }
  },
  plugins: []
};
