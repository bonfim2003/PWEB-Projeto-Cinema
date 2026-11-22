/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
      fontWeight: {
        // figma:gGOWXmP5 — start
        "figma-normal": "400",
        "figma-medium": "500",
        "figma-semibold": "600",
        "figma-bold": "700",
        "figma-extrabold": "800",
        "figma-black": "900",
        // figma:gGOWXmP5 — end
      },
      lineHeight: {
        // figma:gGOWXmP5 — start
        "figma-7": "7px",
        "figma-8": "8px",
        "figma-9": "9px",
        "figma-10": "10px",
        "figma-11": "11px",
        "figma-12": "12px",
        "figma-14": "14px",
        "figma-15": "15px",
        "figma-16": "16px",
        "figma-18": "18px",
        "figma-19": "19px",
        "figma-20": "20px",
        "figma-22": "22px",
        "figma-23": "23px",
        "figma-24": "24px",
        "figma-26": "26px",
        "figma-28": "28px",
        "figma-32": "32px",
        "figma-33": "33px",
        "figma-36": "36px",
        "figma-40": "40px",
        "figma-48": "48px",
        "figma-60": "60px",
        "figma-64": "64px",
        "figma-72": "72px",
        // figma:gGOWXmP5 — end
      },
      fontSize: {
        // figma:gGOWXmP5 — start
        "figma-7": "7px",
        "figma-8": "8px",
        "figma-9": "9px",
        "figma-10": "10px",
        "figma-11": "11px",
        "figma-12": "12px",
        "figma-13": "13px",
        "figma-14": "14px",
        "figma-16": "16px",
        "figma-18": "18px",
        "figma-20": "20px",
        "figma-24": "24px",
        "figma-30": "30px",
        "figma-36": "36px",
        "figma-48": "48px",
        "figma-56": "56px",
        "figma-60": "60px",
        "figma-72": "72px",
        // figma:gGOWXmP5 — end
      },
  		opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, `${i / 100}`])),
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
        // figma:gGOWXmP5 — start
        "figma-primary": "hsl(var(--figma-primary))",
        "figma-secondary": "hsl(var(--figma-secondary))",
        "figma-accent": "hsl(var(--figma-accent))",
        "figma-muted": "hsl(var(--figma-muted))",
        "figma-surface": "hsl(var(--figma-surface))",
        "figma-border": "hsl(var(--figma-border))",
        "figma-highlight": "hsl(var(--figma-highlight))",
        "figma-subtle": "hsl(var(--figma-subtle))",
        "figma-color-9": "hsl(var(--figma-color-9))",
        "figma-color-10": "hsl(var(--figma-color-10))",
        "figma-color-11": "hsl(var(--figma-color-11))",
        "figma-color-12": "hsl(var(--figma-color-12))",
        "figma-color-13": "hsl(var(--figma-color-13))",
        "figma-color-14": "hsl(var(--figma-color-14))",
        "figma-color-15": "hsl(var(--figma-color-15))",
        "figma-color-16": "hsl(var(--figma-color-16))",
        "figma-color-17": "hsl(var(--figma-color-17))",
        "figma-color-18": "hsl(var(--figma-color-18))",
        "figma-color-19": "hsl(var(--figma-color-19))",
        "figma-color-20": "hsl(var(--figma-color-20))",
        "figma-text-1": "hsl(var(--figma-text-1))",
        "figma-text-2": "hsl(var(--figma-text-2))",
        "figma-text-3": "hsl(var(--figma-text-3))",
        "figma-text-4": "hsl(var(--figma-text-4))",
        "figma-text-5": "hsl(var(--figma-text-5))",
        // figma:gGOWXmP5 — end
      
  			cream: '#F3EBDD',
  			ink: '#343344',
  			coral: '#E77F79',
  			blush: '#D99AAE',
  			lagoon: '#75AAA4',
  			mustard: '#E9B94F',
  			paper: '#EDE1CC',
  			plum: '#5B3A55',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
        // figma:gGOWXmP5 — start
        "figma-liberation-serif": ['"Liberation Serif"', 'sans-serif'],
        "paragraph": ['"Space Grotesk"', 'sans-serif'],
        "figma-newsreader": ['"Newsreader"', 'sans-serif'],
        "figma-liberation-mono": ['"Liberation Mono"', 'sans-serif'],
        "figma-plus-jakarta-sans": ['"Plus Jakarta Sans"', 'sans-serif'],
        "figma-playfair-display": ['"Playfair Display"', 'sans-serif'],
        "figma-liberation-sans": ['"Liberation Sans"', 'sans-serif'],
        "figma-freesans": ['"FreeSans"', 'sans-serif'],
        // figma:gGOWXmP5 — end
      
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			serif: ['var(--font-serif)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
