/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#050505",
          dark: "#0A0A0B",
          card: "#121214",
          border: "#1F1F23",
          accent: "#0070F3",
          muted: "#888888",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      letterSpacing: {
        tighter: "-0.05em",
        widest: "0.1em",
      },
    },
  },
  plugins: [],
};
