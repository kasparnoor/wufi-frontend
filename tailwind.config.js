const path = require("path")

module.exports = {
  darkMode: ["class", "class"],
  presets: [require("@medusajs/ui-preset")],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/modules/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
  	extend: {
  		transitionProperty: {
  			width: 'width margin',
  			height: 'height',
  			bg: 'background-color',
  			display: 'display opacity',
  			visibility: 'visibility',
  			padding: 'padding-top padding-right padding-bottom padding-left'
  		},
  		colors: {
  			grey: {
  				'0': '#FFFFFF',
  				'5': '#F9FAFB',
  				'10': '#F3F4F6',
  				'20': '#E5E7EB',
  				'30': '#D1D5DB',
  				'40': '#9CA3AF',
  				'50': '#6B7280',
  				'60': '#4B5563',
  				'70': '#374151',
  				'80': '#1F2937',
  				'90': '#111827'
  			},
  			ui: {
  				bg: 'rgb(var(--color-bg) / <alpha-value>)',
  				fg: 'rgb(var(--color-fg) / <alpha-value>)',
  				'fg-base': 'rgb(var(--color-fg-base) / <alpha-value>)',
  				'fg-subtle': 'rgb(var(--color-fg-subtle) / <alpha-value>)',
  				'fg-muted': 'rgb(var(--color-fg-muted) / <alpha-value>)',
  				border: 'rgb(var(--color-border) / <alpha-value>)',
  				'border-base': 'rgb(var(--color-border-base) / <alpha-value>)',
  				'border-hover': 'rgb(var(--color-border-hover) / <alpha-value>)',
  				'border-selected': 'rgb(var(--color-border-selected) / <alpha-value>)',
  				'border-disabled': 'rgb(var(--color-border-disabled) / <alpha-value>)',
  				'border-focus': 'rgb(var(--color-border-focus) / <alpha-value>)',
  				'border-pressed': 'rgb(var(--color-border-pressed) / <alpha-value>)',
  				'border-transparent': 'rgb(var(--color-border-transparent) / <alpha-value>)',
  				'input-bg-base': 'rgb(var(--color-input-bg-base) / <alpha-value>)',
  				'input-bg-hover': 'rgb(var(--color-input-bg-hover) / <alpha-value>)',
  				'input-bg-disabled': 'rgb(var(--color-input-bg-disabled) / <alpha-value>)',
  				'input-bg-checked': 'rgb(var(--color-input-bg-checked) / <alpha-value>)',
  				'input-bg-pressed': 'rgb(var(--color-input-bg-pressed) / <alpha-value>)',
  				'input-border-base': 'rgb(var(--color-input-border-base) / <alpha-value>)',
  				'input-border-hover': 'rgb(var(--color-input-border-hover) / <alpha-value>)',
  				'input-border-disabled': 'rgb(var(--color-input-border-disabled) / <alpha-value>)',
  				'input-border-checked': 'rgb(var(--color-input-border-checked) / <alpha-value>)',
  				'input-border-pressed': 'rgb(var(--color-input-border-pressed) / <alpha-value>)',
  				'input-border-focus': 'rgb(var(--color-input-border-focus) / <alpha-value>)',
  				'input-border-transparent': 'rgb(var(--color-input-border-transparent) / <alpha-value>)',
  				'input-fg-base': 'rgb(var(--color-input-fg-base) / <alpha-value>)',
  				'input-fg-hover': 'rgb(var(--color-input-fg-hover) / <alpha-value>)',
  				'input-fg-disabled': 'rgb(var(--color-input-fg-disabled) / <alpha-value>)',
  				'input-fg-checked': 'rgb(var(--color-input-fg-checked) / <alpha-value>)',
  				'input-fg-pressed': 'rgb(var(--color-input-fg-pressed) / <alpha-value>)',
  				'input-fg-placeholder': 'rgb(var(--color-input-fg-placeholder) / <alpha-value>)',
  				'input-icon-base': 'rgb(var(--color-input-icon-base) / <alpha-value>)',
  				'input-icon-hover': 'rgb(var(--color-input-icon-hover) / <alpha-value>)',
  				'input-icon-disabled': 'rgb(var(--color-input-icon-disabled) / <alpha-value>)',
  				'input-icon-checked': 'rgb(var(--color-input-icon-checked) / <alpha-value>)',
  				'input-icon-pressed': 'rgb(var(--color-input-icon-pressed) / <alpha-value>)',
  				'input-icon-focus': 'rgb(var(--color-input-icon-focus) / <alpha-value>)',
  				'input-icon-transparent': 'rgb(var(--color-input-icon-transparent) / <alpha-value>)',
  				'interactive-bg-base': 'rgb(var(--color-interactive-bg-base) / <alpha-value>)',
  				'interactive-bg-hover': 'rgb(var(--color-interactive-bg-hover) / <alpha-value>)',
  				'interactive-bg-disabled': 'rgb(var(--color-interactive-bg-disabled) / <alpha-value>)',
  				'interactive-bg-pressed': 'rgb(var(--color-interactive-bg-pressed) / <alpha-value>)',
  				'interactive-bg-selected': 'rgb(var(--color-interactive-bg-selected) / <alpha-value>)',
  				'interactive-bg-transparent': 'rgb(var(--color-interactive-bg-transparent) / <alpha-value>)',
  				'interactive-border-base': 'rgb(var(--color-interactive-border-base) / <alpha-value>)',
  				'interactive-border-hover': 'rgb(var(--color-interactive-border-hover) / <alpha-value>)',
  				'interactive-border-disabled': 'rgb(var(--color-interactive-border-disabled) / <alpha-value>)',
  				'interactive-border-pressed': 'rgb(var(--color-interactive-border-pressed) / <alpha-value>)',
  				'interactive-border-selected': 'rgb(var(--color-interactive-border-selected) / <alpha-value>)',
  				'interactive-border-focus': 'rgb(var(--color-interactive-border-focus) / <alpha-value>)',
  				'interactive-border-transparent': 'rgb(var(--color-interactive-border-transparent) / <alpha-value>)',
  				'interactive-fg-base': 'rgb(var(--color-interactive-fg-base) / <alpha-value>)',
  				'interactive-fg-hover': 'rgb(var(--color-interactive-fg-hover) / <alpha-value>)',
  				'interactive-fg-disabled': 'rgb(var(--color-interactive-fg-disabled) / <alpha-value>)',
  				'interactive-fg-pressed': 'rgb(var(--color-interactive-fg-pressed) / <alpha-value>)',
  				'interactive-fg-selected': 'rgb(var(--color-interactive-fg-selected) / <alpha-value>)',
  				'interactive-fg-transparent': 'rgb(var(--color-interactive-fg-transparent) / <alpha-value>)',
  				'interactive-icon-base': 'rgb(var(--color-interactive-icon-base) / <alpha-value>)',
  				'interactive-icon-hover': 'rgb(var(--color-interactive-icon-hover) / <alpha-value>)',
  				'interactive-icon-disabled': 'rgb(var(--color-interactive-icon-disabled) / <alpha-value>)',
  				'interactive-icon-pressed': 'rgb(var(--color-interactive-icon-pressed) / <alpha-value>)',
  				'interactive-icon-selected': 'rgb(var(--color-interactive-icon-selected) / <alpha-value>)',
  				'interactive-icon-focus': 'rgb(var(--color-interactive-icon-focus) / <alpha-value>)',
  				'interactive-icon-transparent': 'rgb(var(--color-interactive-icon-transparent) / <alpha-value>)',
  				'tag-bg-base': 'rgb(var(--color-tag-bg-base) / <alpha-value>)',
  				'tag-bg-hover': 'rgb(var(--color-tag-bg-hover) / <alpha-value>)',
  				'tag-bg-disabled': 'rgb(var(--color-tag-bg-disabled) / <alpha-value>)',
  				'tag-bg-pressed': 'rgb(var(--color-tag-bg-pressed) / <alpha-value>)',
  				'tag-bg-selected': 'rgb(var(--color-tag-bg-selected) / <alpha-value>)',
  				'tag-bg-transparent': 'rgb(var(--color-tag-bg-transparent) / <alpha-value>)',
  				'tag-border-base': 'rgb(var(--color-tag-border-base) / <alpha-value>)',
  				'tag-border-hover': 'rgb(var(--color-tag-border-hover) / <alpha-value>)',
  				'tag-border-disabled': 'rgb(var(--color-tag-border-disabled) / <alpha-value>)',
  				'tag-border-pressed': 'rgb(var(--color-tag-border-pressed) / <alpha-value>)',
  				'tag-border-selected': 'rgb(var(--color-tag-border-selected) / <alpha-value>)',
  				'tag-border-focus': 'rgb(var(--color-tag-border-focus) / <alpha-value>)',
  				'tag-border-transparent': 'rgb(var(--color-tag-border-transparent) / <alpha-value>)',
  				'tag-fg-base': 'rgb(var(--color-tag-fg-base) / <alpha-value>)',
  				'tag-fg-hover': 'rgb(var(--color-tag-fg-hover) / <alpha-value>)',
  				'tag-fg-disabled': 'rgb(var(--color-tag-fg-disabled) / <alpha-value>)',
  				'tag-fg-pressed': 'rgb(var(--color-tag-fg-pressed) / <alpha-value>)',
  				'tag-fg-selected': 'rgb(var(--color-tag-fg-selected) / <alpha-value>)',
  				'tag-fg-transparent': 'rgb(var(--color-tag-fg-transparent) / <alpha-value>)',
  				'tag-icon-base': 'rgb(var(--color-tag-icon-base) / <alpha-value>)',
  				'tag-icon-hover': 'rgb(var(--color-tag-icon-hover) / <alpha-value>)',
  				'tag-icon-disabled': 'rgb(var(--color-tag-icon-disabled) / <alpha-value>)',
  				'tag-icon-pressed': 'rgb(var(--color-tag-icon-pressed) / <alpha-value>)',
  				'tag-icon-selected': 'rgb(var(--color-tag-icon-selected) / <alpha-value>)',
  				'tag-icon-focus': 'rgb(var(--color-tag-icon-focus) / <alpha-value>)',
  				'tag-icon-transparent': 'rgb(var(--color-tag-icon-transparent) / <alpha-value>)',
  				'badge-bg-base': 'rgb(var(--color-badge-bg-base) / <alpha-value>)',
  				'badge-bg-hover': 'rgb(var(--color-badge-bg-hover) / <alpha-value>)',
  				'badge-bg-disabled': 'rgb(var(--color-badge-bg-disabled) / <alpha-value>)',
  				'badge-bg-pressed': 'rgb(var(--color-badge-bg-pressed) / <alpha-value>)',
  				'badge-bg-selected': 'rgb(var(--color-badge-bg-selected) / <alpha-value>)',
  				'badge-bg-transparent': 'rgb(var(--color-badge-bg-transparent) / <alpha-value>)',
  				'badge-border-base': 'rgb(var(--color-badge-border-base) / <alpha-value>)',
  				'badge-border-hover': 'rgb(var(--color-badge-border-hover) / <alpha-value>)',
  				'badge-border-disabled': 'rgb(var(--color-badge-border-disabled) / <alpha-value>)',
  				'badge-border-pressed': 'rgb(var(--color-badge-border-pressed) / <alpha-value>)',
  				'badge-border-selected': 'rgb(var(--color-badge-border-selected) / <alpha-value>)',
  				'badge-border-focus': 'rgb(var(--color-badge-border-focus) / <alpha-value>)',
  				'badge-border-transparent': 'rgb(var(--color-badge-border-transparent) / <alpha-value>)',
  				'badge-fg-base': 'rgb(var(--color-badge-fg-base) / <alpha-value>)',
  				'badge-fg-hover': 'rgb(var(--color-badge-fg-hover) / <alpha-value>)',
  				'badge-fg-disabled': 'rgb(var(--color-badge-fg-disabled) / <alpha-value>)',
  				'badge-fg-pressed': 'rgb(var(--color-badge-fg-pressed) / <alpha-value>)',
  				'badge-fg-selected': 'rgb(var(--color-badge-fg-selected) / <alpha-value>)',
  				'badge-fg-transparent': 'rgb(var(--color-badge-fg-transparent) / <alpha-value>)',
  				'badge-icon-base': 'rgb(var(--color-badge-icon-base) / <alpha-value>)',
  				'badge-icon-hover': 'rgb(var(--color-badge-icon-hover) / <alpha-value>)',
  				'badge-icon-disabled': 'rgb(var(--color-badge-icon-disabled) / <alpha-value>)',
  				'badge-icon-pressed': 'rgb(var(--color-badge-icon-pressed) / <alpha-value>)',
  				'badge-icon-selected': 'rgb(var(--color-badge-icon-selected) / <alpha-value>)',
  				'badge-icon-focus': 'rgb(var(--color-badge-icon-focus) / <alpha-value>)',
  				'badge-icon-transparent': 'rgb(var(--color-badge-icon-transparent) / <alpha-value>)',
  				'notice-bg-base': 'rgb(var(--color-notice-bg-base) / <alpha-value>)',
  				'notice-bg-hover': 'rgb(var(--color-notice-bg-hover) / <alpha-value>)',
  				'notice-bg-disabled': 'rgb(var(--color-notice-bg-disabled) / <alpha-value>)',
  				'notice-bg-pressed': 'rgb(var(--color-notice-bg-pressed) / <alpha-value>)',
  				'notice-bg-selected': 'rgb(var(--color-notice-bg-selected) / <alpha-value>)',
  				'notice-bg-transparent': 'rgb(var(--color-notice-bg-transparent) / <alpha-value>)',
  				'notice-border-base': 'rgb(var(--color-notice-border-base) / <alpha-value>)',
  				'notice-border-hover': 'rgb(var(--color-notice-border-hover) / <alpha-value>)',
  				'notice-border-disabled': 'rgb(var(--color-notice-border-disabled) / <alpha-value>)',
  				'notice-border-pressed': 'rgb(var(--color-notice-border-pressed) / <alpha-value>)',
  				'notice-border-selected': 'rgb(var(--color-notice-border-selected) / <alpha-value>)',
  				'notice-border-focus': 'rgb(var(--color-notice-border-focus) / <alpha-value>)',
  				'notice-border-transparent': 'rgb(var(--color-notice-border-transparent) / <alpha-value>)',
  				'notice-fg-base': 'rgb(var(--color-notice-fg-base) / <alpha-value>)',
  				'notice-fg-hover': 'rgb(var(--color-notice-fg-hover) / <alpha-value>)',
  				'notice-fg-disabled': 'rgb(var(--color-notice-fg-disabled) / <alpha-value>)',
  				'notice-fg-pressed': 'rgb(var(--color-notice-fg-pressed) / <alpha-value>)',
  				'notice-fg-selected': 'rgb(var(--color-notice-fg-selected) / <alpha-value>)',
  				'notice-fg-transparent': 'rgb(var(--color-notice-fg-transparent) / <alpha-value>)',
  				'notice-icon-base': 'rgb(var(--color-notice-icon-base) / <alpha-value>)',
  				'notice-icon-hover': 'rgb(var(--color-notice-icon-hover) / <alpha-value>)',
  				'notice-icon-disabled': 'rgb(var(--color-notice-icon-disabled) / <alpha-value>)',
  				'notice-icon-pressed': 'rgb(var(--color-notice-icon-pressed) / <alpha-value>)',
  				'notice-icon-selected': 'rgb(var(--color-notice-icon-selected) / <alpha-value>)',
  				'notice-icon-focus': 'rgb(var(--color-notice-icon-focus) / <alpha-value>)',
  				'notice-icon-transparent': 'rgb(var(--color-notice-icon-transparent) / <alpha-value>)'
  			},
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
  			}
  		},
  		borderRadius: {
  			none: '0px',
  			soft: '2px',
  			base: '4px',
  			rounded: '8px',
  			large: '16px',
  			circle: '9999px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		maxWidth: {
  			'8xl': '100rem'
  		},
  		screens: {
  			'2xsmall': '320px',
  			xsmall: '512px',
  			small: '1024px',
  			medium: '1280px',
  			large: '1440px',
  			xlarge: '1680px',
  			'2xlarge': '1920px'
  		},
  		fontSize: {
  			'3xl': '2rem'
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Helvetica Neue',
  				'Ubuntu',
  				'sans-serif'
  			]
  		},
  		keyframes: {
  			ring: {
  				'0%': {
  					transform: 'rotate(0deg)'
  				},
  				'100%': {
  					transform: 'rotate(360deg)'
  				}
  			},
  			'fade-in-right': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'fade-in-top': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'fade-out-top': {
  				'0%': {
  					height: '100%'
  				},
  				'99%': {
  					height: '0'
  				},
  				'100%': {
  					visibility: 'hidden'
  				}
  			},
  			'accordion-slide-up': {
  				'0%': {
  					height: 'var(--radix-accordion-content-height)',
  					opacity: '1'
  				},
  				'100%': {
  					height: '0',
  					opacity: '0'
  				}
  			},
  			'accordion-slide-down': {
  				'0%': {
  					'min-height': '0',
  					'max-height': '0',
  					opacity: '0'
  				},
  				'100%': {
  					'min-height': 'var(--radix-accordion-content-height)',
  					'max-height': 'none',
  					opacity: '1'
  				}
  			},
  			enter: {
  				'0%': {
  					transform: 'scale(0.9)',
  					opacity: 0
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: 1
  				}
  			},
  			leave: {
  				'0%': {
  					transform: 'scale(1)',
  					opacity: 1
  				},
  				'100%': {
  					transform: 'scale(0.9)',
  					opacity: 0
  				}
  			},
  			'slide-in': {
  				'0%': {
  					transform: 'translateY(-100%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			},
  			'slideDownAndFade': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-2px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slideLeftAndFade': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(2px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'slideUpAndFade': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(2px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slideRightAndFade': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-2px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			}
  		},
  		animation: {
  			ring: 'ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
  			'fade-in-right': 'fade-in-right 0.3s cubic-bezier(0.5, 0, 0.5, 1) forwards',
  			'fade-in-top': 'fade-in-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards',
  			'fade-out-top': 'fade-out-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards',
  			'accordion-open': 'accordion-slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards',
  			'accordion-close': 'accordion-slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards',
  			enter: 'enter 200ms ease-out',
  			'slide-in': 'slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)',
  			leave: 'leave 150ms ease-in forwards',
  			'slideDownAndFade': 'slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
  			'slideLeftAndFade': 'slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
  			'slideUpAndFade': 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
  			'slideRightAndFade': 'slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-radix")(),
    require("@tailwindcss/typography"),
      require("tailwindcss-animate")
],
}
