import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

/**
 * Find or create a user record from a Google OAuth profile.
 * If a user with the same email already exists (local account),
 * we link the Google provider to that existing account.
 */
async function findOrCreateOAuthUser({ provider, providerId, email, name, avatar }) {
    // 1. Try to find by provider + providerId (returning user via same provider)
    let user = await User.findOne({ provider, providerId });
    if (user) return user;

    // 2. Try to find by email — link provider to the existing account
    user = await User.findOne({ email });
    if (user) {
        user.provider = provider;
        user.providerId = providerId;
        if (!user.avatar && avatar) user.avatar = avatar;
        await user.save();
        return user;
    }

    // 3. New user — create a record (password is null for OAuth users)
    user = await User.create({
        name,
        email,
        provider,
        providerId,
        avatar: avatar || null,
        password: null
    });

    return user;
}

export function configurePassport() {
    // ── Google OAuth 2.0 ────────────────────────────────────────────────────────
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
                    scope: ["profile", "email"]
                },
                async (_accessToken, _refreshToken, profile, done) => {
                    try {
                        const email =
                            profile.emails?.[0]?.value?.toLowerCase() || null;

                        if (!email) {
                            return done(new Error("Google account has no email address."), null);
                        }

                        const user = await findOrCreateOAuthUser({
                            provider: "google",
                            providerId: profile.id,
                            email,
                            name: profile.displayName || email.split("@")[0],
                            avatar: profile.photos?.[0]?.value || null
                        });

                        return done(null, user);
                    } catch (err) {
                        return done(err, null);
                    }
                }
            )
        );
    }

    // Minimal serialisation (we use JWT, so sessions are stateless)
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
}

export default passport;
