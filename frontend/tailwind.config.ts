import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                background: "rgb(var(--background))",
                foreground: "rgb(var(--foreground))",
                card: "rgb(var(--card))",
                "card-foreground": "rgb(var(--card-foreground))",
                popover: "rgb(var(--popover))",
                "popover-foreground": "rgb(var(--popover-foreground))",
                primary: "hsl(var(--primary))",
                "primary-foreground": "rgb(var(--primary-foreground))",
                secondary: "rgb(var(--secondary))",
                "secondary-foreground": "rgb(var(--secondary-foreground))",
                muted: "rgb(var(--muted))",
                "muted-foreground": "rgb(var(--muted-foreground))",
                accent: "hsl(var(--accent))",
                "accent-foreground": "rgb(var(--accent-foreground))",
                destructive: "hsl(var(--destructive))",
                "destructive-foreground": "hsl(var(--destructive-foreground))",
                border: "rgb(var(--border))",
                input: "rgb(var(--input))",
                ring: "hsl(var(--ring))",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            animation: {
                fadeIn: "fadeIn 0.4s ease-out forwards",
            },
        },
    },
    plugins: [],
};
export default config;
