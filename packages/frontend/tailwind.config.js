/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                'btn-signup': '#74C5F8',
                'btn-login': '#DC832B',
                link: '#5F8297',
            },
            spacing: {
                30: '7.5rem',
            },
            boxShadow: {
                base: '0px 0px 20px 0px rgba(0,0,0,0.03)',
            },
            backgroundImage: {
                'dark-gradient':
                    'linear-gradient(115.09deg, rgba(47, 24, 6, 0.9) 2.26%, rgba(0, 0, 0, 0.9) 51.07%, rgba(5, 40, 46, 0.9) 98.92%)',
                'custom-gradient':
                    'linear-gradient(158.98deg, #FFFFFF 0%, #E2E2E2 49.14%, #FFFFFF 99.27%)',
            },
            lineHeight: {
                'slightly-loose': '1.8',
            },
        },
    },
    plugins: [require('@tailwindcss/typography'), require('daisyui')],
    daisyui: {
        themes: [
            {
                dark: {
                    ...require('daisyui/src/theming/themes')[
                        '[data-theme=dark]'
                    ],
                    primary: '#FF892A',
                    secondary: '#52ACBC',
                    accent: '#3F3F3F',
                    error: '#FF1D1D',
                    '--rounded-btn': '0.75rem',
                },
            },
        ],
    },
}
