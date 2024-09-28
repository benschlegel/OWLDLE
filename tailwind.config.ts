import type { Config } from 'tailwindcss';
import type { PluginAPI } from 'tailwindcss/types/config';

const config: Config = {
	darkMode: ['class'],
	content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))',
				},
				correct: 'hsl(var(--correct))',
				incorrect: 'hsl(var(--incorrect))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			scrollbarGutter: {
				stable: 'stable',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0',
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
					},
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
					},
					to: {
						height: '0',
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	corePlugins: {
		// Use custom aspect ratio plugin for better browser support
		aspectRatio: false,
	},
	plugins: [
		require('tailwindcss-animate'),
		({ matchUtilities, theme /* … */ }: PluginAPI) => {
			// …
			matchUtilities(
				// https://gist.github.com/olets/9b833a33d01384eed1e9f1e106003a3b
				{
					aspect: (value) => ({
						'@supports (aspect-ratio: 1 / 1)': {
							aspectRatio: value,
						},
						'@supports not (aspect-ratio: 1 / 1)': {
							// https://github.com/takamoso/postcss-aspect-ratio-polyfill

							'&::before': {
								content: '""',
								float: 'left',
								paddingTop: `calc(100% / (${value}))`,
							},
							'&::after': {
								clear: 'left',
								content: '""',
								display: 'block',
							},
						},
					}),
				},
				{ values: theme('aspectRatio') }
			);
		},
		({ addUtilities }: PluginAPI) => {
			addUtilities({
				'.scrollbar-stable': {
					'scrollbar-gutter': 'stable',
					// 'padding-right': 'calc(100vw - 100%)',
				},
			});
		},
	],
};
export default config;
