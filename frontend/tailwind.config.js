/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-secondary": "#ffffff",
        "on-error": "#ffffff",
        "tertiary-fixed": "#e6e2db",
        "surface-dim": "#dadada",
        "on-secondary-fixed": "#1d1c16",
        "surface-container-highest": "#e2e2e2",
        "surface-bright": "#f9f9f9",
        "surface-container-low": "#f3f3f3",
        "inverse-surface": "#2f3131",
        "secondary-container": "#e4dfd6",
        "surface-container-high": "#e8e8e8",
        "on-surface": "#1a1c1c",
        "on-primary": "#ffffff",
        "on-primary-fixed-variant": "#474747",
        "on-secondary-container": "#65625b",
        "surface-variant": "#e2e2e2",
        "on-error-container": "#93000a",
        "surface-tint": "#5f5e5e",
        "primary-fixed-dim": "#c8c6c5",
        "error": "#ba1a1a",
        "on-tertiary-container": "#96938d",
        "tertiary-fixed-dim": "#cac6bf",
        "primary": "#171818",
        "on-tertiary-fixed-variant": "#484742",
        "secondary": "#615e57",
        "outline": "#747878",
        "on-primary-container": "#949393",
        "secondary-fixed": "#e7e2d9",
        "surface-container-lowest": "#ffffff",
        "primary-fixed": "#e4e2e1",
        "tertiary-container": "#2d2c28",
        "on-background": "#1a1c1c",
        "secondary-fixed-dim": "#cbc6bd",
        "inverse-primary": "#c8c6c5",
        "tertiary": "#181814",
        "on-tertiary-fixed": "#1c1c18",
        "surface-container": "#eeeeee",
        "on-primary-fixed": "#1b1c1c",
        "error-container": "#ffdad6",
        "background": "#f9f9f9",
        "on-tertiary": "#ffffff",
        "on-secondary-fixed-variant": "#494740",
        "inverse-on-surface": "#f0f1f1",
        "on-surface-variant": "#444748",
        "primary-container": "#2c2c2c",
        "surface": "#f9f9f9",
        "outline-variant": "#c4c7c7"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "unit": "8px",
        "asymmetric-offset": "120px",
        "container-padding": "64px",
        "element-gap": "24px"
      },
      fontFamily: {
        "label-caps": ["Space Grotesk"],
        "headline-sm": ["Playfair Display"],
        "display-md": ["Playfair Display"],
        "mono-data": ["Space Grotesk"],
        "body-md": ["Space Grotesk"],
        "display-lg-mobile": ["Playfair Display"],
        "data-lg": ["Space Grotesk"],
        "display-lg": ["Playfair Display"]
      },
      fontSize: {
        "label-caps": ["12px", { lineHeight: "1.0", letterSpacing: "0.1em", fontWeight: "600" }],
        "headline-sm": ["24px", { lineHeight: "1.3", fontWeight: "500" }],
        "display-md": ["32px", { lineHeight: "1.2", fontWeight: "400" }],
        "mono-data": ["13px", { lineHeight: "1.4", fontWeight: "400" }],
        "body-md": ["15px", { lineHeight: "1.6", fontWeight: "400" }],
        "display-lg-mobile": ["32px", { lineHeight: "1.2", fontWeight: "400" }],
        "data-lg": ["18px", { lineHeight: "1.5", letterSpacing: "-0.01em", fontWeight: "500" }],
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "400" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
