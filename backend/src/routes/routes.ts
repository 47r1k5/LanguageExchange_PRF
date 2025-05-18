import { Router, Request, Response, NextFunction } from "express";
import { PassportStatic } from "passport";
import { User, IUser } from "../model/User";
import { Class } from "../model/Class";
import { logger } from "../middleware/logger";
import { ELogType } from "../enums/ELogType";
import { Language } from "../model/Languages";
import { ERole } from "../enums/ERole";

export const configureRoutes = (
  passport: PassportStatic,
  router: Router
): Router => {
  router.get("/", (req: Request, res: Response) => {
    res.status(200).send("Welcome to the Language Exchange API!");
  });

  router.get("/checkAuth", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      res.status(200).send(true);
    } else {
      res.status(401).send(false);
    }
  });

  router.get("/checkRole", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const user = req.user as IUser;
      res.status(200).json(user.role);
    } else {
      res.status(401).json({message:"User is not logged in."});
    }
  });

  router.get("/languages", (req: Request, res: Response) => {
    Language.find()
      .then((languages) => {
        if (!languages || languages.length === 0) {
          return res.status(404).json({ message: "No languages found" });
        }
        let languagesList = languages.map((lang) => lang.name);
        return res.status(200).json(languagesList);
      })
      .catch((error) => {
        logger(ELogType.ERROR, `Error fetching languages: ${error}`);
        res.status(500).send("Error fetching languages.");
      });
  });

  router.get("/mentors", (req: Request, res: Response) => {
    const { languages } = req.query;
    const filter: any = { role: "mentor" };

    if (languages) {
      const langs = (languages as string)
        .split(",")
        .map((l) => l.trim())
        .filter((l) => l.length);
      if (langs.length) {
        filter.languages_known = { $in: langs };
      }
    }

    const mentors = User.find(filter)
      .then((mentors) => {
        return res.status(200).json(mentors || []);
      })
      .catch((error) => {
        logger(ELogType.ERROR, `Error fetching mentors: ${error}`);
        res.status(500).send("Error fetching mentors.");
      });
  });

  router.get("/mentors/:id", (req: Request, res: Response) => {
    User.findById(req.params.id)
      .populate("classes", "name level learn_language free_space")
      .then((mentor) => {
        if (!mentor || mentor.role !== "mentor") {
          return res.status(404).send("Mentor not found.");
        }
        res.json(mentor);
      })
      .catch((error) => {
        logger(ELogType.ERROR, `Error fetching mentor: ${error}`);
        res.status(500).send("Error fetching mentor.");
      });
  });

  router.get("/class/:id", (req: Request, res: Response) => {
    Class.findById(req.params.id)
      .populate("teacherId", "first_name last_name").populate('studentsIds', 'first_name last_name email')
      .then((classItem) => {
        if (!classItem) {
          return res.status(404).send("Class not found.");
        } else {
          res.json(classItem);
        }
      })
      .catch((error) => {
        logger(ELogType.ERROR, `Error fetching class: ${error}`);
      });
  });

  router.put("/class/:id/enroll", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const user = req.user as IUser;
      const classId = req.params.id;

      Class.findByIdAndUpdate(
        classId,
        {
          $addToSet: { studentsIds: user._id },
          $inc: { free_space: -1 },
        },
        { new: true }
      )
        .then((updatedClass) => {
          if (!updatedClass) {
            res.status(404).send({message:"Class not found."});
          } else {
            res.status(200).send(updatedClass);
          }
        })
        .catch((error) => {
          logger(ELogType.ERROR, `Error enrolling in class: ${error}`);
          res.status(500).send({message:`Error enrolling in class: ${error}`});
        });
    } else {
      res.status(401).send("User is not logged in.");
    }
  });

  router.put("/class/:id/leave", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const user = req.user as IUser;
      const classId = req.params.id;

      Class.findByIdAndUpdate(
        classId,
        {
          $pull: { studentsIds: user._id },
          $inc: { free_space: 1 },
        },
        { new: true }
      )
        .then((updatedClass) => {
          if (!updatedClass) {
            res.status(404).send("Class not found.");
          } else {
            res.status(200).send(updatedClass);}}).catch((error) => {
            logger(ELogType.ERROR, `Error leaving class: ${error}`);
            res.status(500).send("Error leaving class.");
          });
        }});

  router.get("/classes", (req: Request, res: Response) => {
    const { learnLanguage, speakLanguage, level } = req.query;
    const filter: any = {};

    if (learnLanguage) {
      const langs = (learnLanguage as string).split(",").map((l) => l.trim());
      filter.learn_language = { $in: langs };
    }
    if (speakLanguage) {
      const langs = (speakLanguage as string).split(",").map((l) => l.trim());
      filter.speak_language = { $in: langs };
    }
    if (level) {
      filter.level = level;
    }

    Class.find(filter)
      .populate("teacherId", "first_name last_name")
      .then((classes) => {
        if (!classes || classes.length === 0) {
          return res.status(200).json([]);
        }
        return res.status(200).json(classes);
      })
      .catch((error) => {
        logger(ELogType.ERROR, `Error fetching classes: ${error}`);
        res.status(500).send("Error fetching classes.");
      });
  });

  router.post("/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (error: string | null, user: typeof User) => {
        if (error) {
          console.log(error);
          res.status(500).send(error);
        } else {
          if (!user) {
            res.status(400).send("User not found.");
          } else {
            req.login(user, (err: string | null) => {
              if (err) {
                console.log(err);
                res.status(500).send("Internal server error.");
              } else {
                res.status(200).send(user);
              }
            });
          }
        }
      }
    )(req, res, next);
  });

  router.post("/register", (req: Request, res: Response) => {
    const {
      email,
      password,
      first_name,
      last_name,
      languages_known,
      languages_learning,
    } = req.body;
    const user = new User({
      email: email,
      password: password,
      first_name: first_name,
      last_name: last_name,
      languages_known: languages_known,
      languages_learning: languages_learning,
    });

    user
      .save()
      .then(() => {
        res.status(200).send("User registered successfully.");
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  });

  router.post("/logout", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      req.logout((error) => {
        if (error) {
          console.log(error);
          res.status(500).send("Internal server error.");
        }
        res.status(200).send("Successfully logged out.");
      });
    } else {
      res.status(500).send("User is not logged in.");
    }
  });

  router.put("/updateProfile", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const user = req.user as IUser;
      const { first_name, last_name, languages_known, languages_learning } =
        req.body;
      User.findByIdAndUpdate(
        user._id,
        { first_name, last_name, languages_known, languages_learning },
        { new: true }
      )
        .then((updatedUser) => {
          res.status(200).send(updatedUser);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send(error);
        });
    } else {
      res.status(401).send("User is not logged in.");
    }
  });

  router.get("/profile", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const user = req.user as IUser;
      res.status(200).send(user);
    } else {
      res.status(401).send("User is not logged in.");
    }
  });

  router.get("/home", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const user = req.user as IUser;
      if (user.role === "admin") {
        res
          .status(200)
          .send(
            `Welcome to the admin page ${user.first_name} ${user.last_name}!`
          );
      } else if (user.role === "mentor") {
        res
          .status(200)
          .send(
            `Welcome to the mentor page ${user.first_name} ${user.last_name}!`
          );
      } else {
        res.status(200).send(`Welcome ${user.first_name} ${user.last_name}!`);
      }
    }
  });

  router.get("/getMyClasses", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const user = req.user as IUser;
      User.findById(user._id).then((user) => {
        if (!user) {
          res.status(404).send("User not found.");
        } else {
          Class.find({ studentsIds: user._id })
            .then((classes) => {
              if (!classes) {
                res.status(404).send("No classes found.");
              } else {
                res.status(200).send(classes);
              }
            })
            .catch((error) => {
              logger(ELogType.ERROR, `Error fetching classes: ${error}`);
              res.status(500).send("Error fetching classes.");
            });
        }
      });
    } else {
      res.status(401).send("User is not logged in.");
    }
  });

  return router;
};
