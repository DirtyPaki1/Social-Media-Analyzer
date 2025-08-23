/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          background: "rgb(var(--background))",
          foreground: "rgb(var(--foreground))",
          primary: "rgb(var(--primary))",
          border: "rgb(var(--border))",
          muted: "rgb(var(--muted))",
          "muted-foreground": "rgb(var(--muted-foreground))",
        },
      },
    },
    plugins: [],
  }