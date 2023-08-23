/** @type {import("tailwindcss").Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                'btn-signup': '#74C5F8',
                'btn-login': '#DC832B',
                link: '#5F8297',
            },
            boxShadow: {
                base: '0px 0px 20px 0px rgba(0,0,0,0.03)',
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
                    '--rounded-btn': '0.75rem',
                },
            },
        ],
    },
}
