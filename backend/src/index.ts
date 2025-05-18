import express from "express";
import { configureRoutes } from "./routes/routes";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import passport from "passport";
import { configurePassport } from "./middleware/passport";
import mongoose from "mongoose";
import {ERole} from "./enums/ERole";
import { User } from "./model/User";
import cors from 'cors';
import { configureAdminRoutes } from "./routes/adminRoutes";
import { configureMentorRoutes } from "./routes/mentorRoutes";

const app = express();
const port = 5000;
const dbUrl =
  "mongodb+srv://patrikmfarkas:lgkZf5NAlzVcYba9@cluster0.ihajfbs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(dbUrl)
  .then(async () => {
    const existingAdmin = await User.findOne({ role: ERole.ADMIN });
    if (existingAdmin) {
      console.log("Admin already exists.");
    } else {
      const newAdmin = new User({
        first_name: "Admin",
        last_name: "User",
        email: "admin@example.com",
        password: "admin123",
        languages_known: [],
        languages_learning: [],
        role: ERole.ADMIN,
      });

      await newAdmin.save();
      console.log("Admin user created successfully.");
    }
  })
  .catch(console.error);

mongoose
  .connect(dbUrl)
  .then((_) => {
    console.log("Successfully connected to MongoDB.");
  })
  .catch((error) => {
    console.log(error);
    return;
  });

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// cookieParser
app.use(cookieParser());

// session
const sessionOptions: expressSession.SessionOptions = {
  secret: "testsecret",
  resave: false,
  saveUninitialized: false,
};
app.use(expressSession(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

configurePassport(passport);

app.use("/", configureRoutes(passport, express.Router()));
app.use("/admin", configureAdminRoutes(passport, express.Router()));
app.use("/mentor", configureMentorRoutes(passport, express.Router()));


app.listen(port, () => {
  console.log("Server is listening on port " + port.toString());
});

console.log("After server is ready.");
