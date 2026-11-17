import "dotenv/config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ObjectId } from "mongodb";
import { getDatabase } from "./database.js";
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});
passport.deserializeUser(async (id, done) => {
  try {
    const db = getDatabase();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { passwordHash: 0 } });
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const db = getDatabase();
        const users = db.collection("users");
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const emailVerified = profile.emails?.[0]?.verified;
        if (!email || emailVerified === false) {
          return done(null, false);
        }
        let user = await users.findOne({ googleId: profile.id });
        if (!user) {
          user = await users.findOne({ email });
          if (user) {
            await users.updateOne(
              { _id: user._id },
              {
                $set: {
                  googleId: profile.id,
                  updatedAt: new Date(),
                },
              },
            );
            user.googleId = profile.id;
          } else {
            const newUser = {
              name: profile.displayName || "",
              email,
              googleId: profile.id,
              passwordHash: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            const result = await users.insertOne(newUser);
            user = { _id: result.insertedId, ...newUser };
          }
        }
        delete user.passwordHash;
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);
export default passport;
