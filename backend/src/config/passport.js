const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// const API_URL = process.env.API_URL || 'http://localhost:5000';
const API_URL = process.env.API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
const socialAuthCallback = async(accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // If user exists but via different provider, update or just login
            if (!user.providerId) {
                user.provider = profile.provider;
                user.providerId = profile.id;
                await user.save();
            }
            return done(null, user);
        }

        // Create new user if not exists
        const newUser = new User({
            firstName: profile.name.givenName || profile.displayName.split(' ')[0],
            lastName: profile.name.familyName || profile.displayName.split(' ')[1] || 'User',
            email: profile.emails[0].value,
            provider: profile.provider,
            providerId: profile.id,
            profileImage: profile.photos ? profile.photos[0].value : '/default-avatar.png',
            role: 'customer',
            isActive: true
        });

        await newUser.save();
        return done(null, newUser);
    } catch (err) {
        return done(err, false);
    }
};

module.exports = function(passport) {
    // 1. GOOGLE STRATEGY
    if (process.env.GOOGLE_CLIENT_ID) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${API_URL}/api/auth/google/callback`
        }, socialAuthCallback));
    }

    // 2. FACEBOOK STRATEGY
    if (process.env.FACEBOOK_APP_ID) {
        passport.use(new FacebookStrategy({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: `${API_URL}/api/auth/facebook/callback`,
            profileFields: ['id', 'emails', 'name', 'photos']
        }, socialAuthCallback));
    }

    // 3. GITHUB STRATEGY
    if (process.env.GITHUB_CLIENT_ID) {
        passport.use(new GitHubStrategy({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: `${API_URL}/api/auth/github/callback`,
            scope: ['user:email']
        }, socialAuthCallback));
    }

    // Serialize/Deserialize
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async(id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};