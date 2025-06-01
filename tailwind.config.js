/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./*.html",
        "./*.js" // Include JS files if classes are added dynamically
    ],
    theme: {
        extend: {
            // Add custom colors, fonts, etc., if needed
            colors: {
                'primary-blue': '#1e90ff',
                'primary-orange': '#ff7f50',
            },
        },
    },
    plugins: [],
}
