import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: { extend: {} },
  safelist: [
    "bg-gray-100","text-gray-800","ring-gray-200",
    "bg-blue-100","text-blue-800","ring-blue-200",
    "bg-red-100","text-red-800","ring-red-200",
    "bg-green-100","text-green-800","ring-green-200",
    "bg-emerald-100","text-emerald-800","ring-emerald-200",
    "bg-zinc-100","text-zinc-800","ring-zinc-200",
    "bg-amber-100","text-amber-800","ring-amber-200",
    "bg-red-500","bg-gray-300","ring-red-300","ring-gray-200","animate-pulse"
  ],
  plugins: [],
}
export default config
