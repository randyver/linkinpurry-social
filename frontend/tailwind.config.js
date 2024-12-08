/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        "wbd-background": "hsl(38, 58%, 96%)",
        "wbd-text": "hsl(37 14.9% 17.1%)",
        "wbd-primary": "hsl(139 12.1% 25.9%)",
        "wbd-secondary": "hsl(42 36.4% 87.1%)",
        "wbd-highlight": "hsl(35 85% 71.2%)",
        "wbd-tertiary": "hsl(33 31.3% 38.8%)",
        "wbd-red": "hsl(0 31.3% 38.8%)",
        "wbd-darker-red": "hsl(0 31.3% 28.8%)",
        "wbd-yellow": "hsl(34 34.4% 50.4%)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      animation: {
        ping: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        fade: 'fade 4s ease-in-out infinite',
      },
      keyframes: {
        ping: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        fade: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};