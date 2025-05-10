import { PassportStatic } from "passport";
import { Strategy } from "passport-local";
import { User } from "../model/User";

export const configurePassport = (passport: PassportStatic): PassportStatic => {
  passport.serializeUser((user: Express.User, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: Express.User, done) => {
    done(null, user);
  });

  passport.use(
    "local",
    new Strategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      (email, password, done) => {
        const query = User.findOne({ email: email });
        query
          .then((user) => {
            if (user === null) {
              done("User not found");
            } else {
              user.comparePassword(password, (err, isMatch) => {
                if (err || !isMatch) {
                  done("Incorrect email or password");
                } else {
                  done(null, user);
                }
              });
            }
          })
          .catch((error) => {
            done(error);
          });
      }
    )
  );

  return passport;
};
