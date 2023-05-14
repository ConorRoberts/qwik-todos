/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}","node_modules/@conorroberts/beluga/dist/*.{cjs,mjs}"],
	theme: {
		extend: {},
	},
	plugins: [],
};
