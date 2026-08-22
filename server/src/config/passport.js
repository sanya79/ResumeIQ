import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import crypto from "crypto";
import { UserRepository } from "../repositories/user.repository.js";

const userRepository = new UserRepository();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

// Google Strategy - Always register, with fallback dummy values if needed
const googleClientId = process.env.GOOGLE_CLIENT_ID || "dummy-google-id";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "dummy-google-secret";
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/v1/auth/google/callback";

passport.use("google", new GoogleStrategy(
  {
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleCallbackUrl,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const fullName = profile.displayName || `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() || "Google User";
      const avatar = profile.photos?.[0]?.value || "";
      const providerId = `GOOGLE:${profile.id}`;

      if (!email) {
        return done(new Error("No email returned from Google profile."), null);
      }

      let user = await userRepository.findByEmail(email);

      if (user) {
        user.authProvider = "GOOGLE";
        user.providerId = providerId;
        if (avatar) user.avatar = avatar;
        user.emailVerified = true;
        await userRepository.save(user);
      } else {
        user = await userRepository.createUser({
          fullName,
          email: email.toLowerCase(),
          passwordHash: crypto.randomBytes(24).toString("hex"),
          authProvider: "GOOGLE",
          providerId,
          avatar,
          role: "CANDIDATE",
          emailVerified: true,
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// GitHub Strategy - Always register, with fallback dummy values if needed
const githubClientId = process.env.GITHUB_CLIENT_ID || "dummy-github-id";
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET || "dummy-github-secret";
const githubCallbackUrl = process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/v1/auth/github/callback";

passport.use("github", new GitHubStrategy(
  {
    clientID: githubClientId,
    clientSecret: githubClientSecret,
    callbackURL: githubCallbackUrl,
    scope: ["user:email"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let email = profile.emails?.[0]?.value;
      const fullName = profile.displayName || profile.username || "GitHub User";
      const avatar = profile.photos?.[0]?.value || profile._json?.avatar_url || "";
      const providerId = `GITHUB:${profile.id}`;

      if (!email) {
        email = `${profile.username || "github_user"}@github.local`;
      }

      let user = await userRepository.findByEmail(email);

      if (user) {
        user.authProvider = "GITHUB";
        user.providerId = providerId;
        if (avatar) user.avatar = avatar;
        user.emailVerified = true;
        await userRepository.save(user);
      } else {
        user = await userRepository.createUser({
          fullName,
          email: email.toLowerCase(),
          passwordHash: crypto.randomBytes(24).toString("hex"),
          authProvider: "GITHUB",
          providerId,
          avatar,
          role: "CANDIDATE",
          emailVerified: true,
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

export default passport;
