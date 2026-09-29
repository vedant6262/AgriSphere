/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))"
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glass: "0 24px 60px rgba(22, 163, 74, 0.14)",
        soft: "0 18px 45px rgba(15, 23, 42, 0.12)"
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top left, rgba(34,197,94,0.2), transparent 30%), radial-gradient(circle at top right, rgba(22,163,74,0.18), transparent 34%), linear-gradient(135deg, rgba(240,253,244,0.96), rgba(220,252,231,0.82))"
      }
    }
  },
  plugins: []
};
