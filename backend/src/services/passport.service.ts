import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import HttpException from "../exceptions/HttpException";
import dotenv from "dotenv";
import DB, { T } from "../database/index.schema";
import { UsersDto } from "../dtos/users.dto";
import { validateOrReject } from "class-validator";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const isVerified = profile.emails[0].email_verified;
                const firstName = profile.name.givenName;
                const lastName = profile.name.familyName;

                if (!email || !firstName) {
                    return done(
                        new HttpException(
                            401,
                            "Required user data missing from Google profile"
                        ),
                        null
                    );
                }

                let user = await DB(T.USERS_TABLE).where({ email }).first();

                if (!user) {
                    const newUser = new UsersDto();
                    newUser.email = email;
                    newUser.first_name = firstName;
                    newUser.last_name = lastName;
                    newUser.username =
                        email.split("@")[0] +
                        "_" +
                        Math.floor(Math.random() * 10000);
                    newUser.email_verified = isVerified;

                    // Validate using class-validator
                    await validateOrReject(newUser);

                    const [insertedUser] = await DB(T.USERS_TABLE)
                        .insert(newUser)
                        .returning("*");
                    user = insertedUser;
                }

                return done(null, user);
            } catch (err) {
                console.error("Google Auth Error:", err);
                return done(err as Error, null);
            }
        }
    )
);

export default passport;
