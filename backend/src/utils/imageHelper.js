// backend/utils/imageHelper.js
const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    // const base = process.env.API_URL || 'https://localhost:5000';
    const base = process.env.API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

module.exports = { getFullImageUrl };