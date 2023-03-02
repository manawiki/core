module.exports = {
   content: ["./app/**/*.{ts,tsx,jsx,js}"],
   darkMode: "class",
   theme: {
      extend: {
         colors: {
            light: "#555555",
            dark: "#CBD5E0",
            bg1Dark: "#202225",
            bg2Dark: "#292b2f",
            bg3Dark: "#2f3136",
            bg4Dark: "#40444b",
         },
         fontFamily: {
            body: ["NunitoSans", "NunitoSans Override"],
            logo: ["new-order", "sans-serif"],
            header: ["karmina", "sans-serif"],
         },
         animation: {
            enter: "enter 200ms ease-out",
            "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
            leave: "leave 150ms ease-in forwards",
         },
         keyframes: {
            enter: {
               "0%": { transform: "scale(0.9)", opacity: 0 },
               "100%": { transform: "scale(1)", opacity: 1 },
            },
            leave: {
               "0%": { transform: "scale(1)", opacity: 1 },
               "100%": { transform: "scale(0.9)", opacity: 0 },
            },
            "slide-in": {
               "0%": { transform: "translateY(-100%)" },
               "100%": { transform: "translateY(0)" },
            },
         },
      },
      screens: {
         mobile: "320px",
         tablet: "768px",
         laptop: "1120px",
         desktop: "1382px",
      },
   },
   plugins: [
      require("@tailwindcss/line-clamp"),
      require("@tailwindcss/forms"),
      require("tailwindcss-bg-patterns"),
   ],
};
