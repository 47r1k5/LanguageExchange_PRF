import { Router, Request, Response, NextFunction } from "express";
import { PassportStatic } from "passport";
import { User, IUser } from "../model/User";
import { Class } from "../model/Class";
import { logger } from "../middleware/logger";
import { ELogType } from "../enums/ELogType";

export const configureRoutes = (
  passport: PassportStatic,
  router: Router
): Router => {
  router.get("/", (req: Request, res: Response) => {
    res.status(200).send("Welcome to the Language Exchange Site!");
  });

  router.get("/getMentors", (req: Request, res: Response) => {
    User.find({ role: "mentor" }).then((mentors) => {
      if (!mentors) {
        res.status(404).send("No mentors found.");
      } else {
        res.status(200).send(mentors);
      }
    });
  });

  router.get("/getMentorsByLanguage", (req: Request, res: Response) => {
    User.find({ role: "mentor" })
      .then((mentors) => {
        if (!mentors) {
          res.status(404).send("No mentors found.");
        } else {
          let filteredMentors = mentors.filter((mentor) => {
            return mentor.languages_known?.includes(req.body.language) || false;
          });
          res.status(200).send(filteredMentors);
        }
      })
      .catch((error) => {
        logger(ELogType.ERROR, `Error fetching mentors: ${error}`);
        res.status(500).send("Error fetching mentors.");
      });
  });

  router.get("/getClasses", (req: Request, res: Response) => {
    Class.find()
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
      language_learning,
    } = req.body;
    const user = new User({
      email: email,
      password: password,
      first_name: first_name,
      last_name: last_name,
      languages_known: languages_known,
      language_learning: language_learning,
    });

    user
      .save()
      .then((data) => {
        res.status(200).send(data);
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
      const { first_name, last_name, languages_known, language_learning } =
        req.body;
      User.findByIdAndUpdate(
        user._id,
        { first_name, last_name, languages_known, language_learning },
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

  router.get("/getClassesByLanguage", (req: Request, res: Response) => {
    const language = req.body.language;
    Class.find({ language: language })
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
  });

  router.get("/getClassesByLevel", (req: Request, res: Response) => {
    const level = req.body.level;
    Class.find({ level: level })
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
  });

  router.get("/getClassesByTeacher", (req: Request, res: Response) => {
    const teacherId = req.body.teacherId;
    Class.find({ teacherId: teacherId })
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
  });

  router.get("/classes", (req: Request, res: Response) => {
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

  router.put("/enrollInClass", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const user = req.user as IUser;
      const classId = req.body.classId;
      Class.findByIdAndUpdate(
        classId,
        {
          $addToSet: { studentsIds: user._id },
        },
        { new: true }
      )
        .then((updatedClass) => {
          if (!updatedClass) {
            res.status(404).send("Class not found.");
          } else {
            User.findByIdAndUpdate(
              user._id,
              {
                $addToSet: { classes: classId },
              },
              { new: true }
            )
              .then((updatedUser) => {
                if (!updatedUser) {
                  res.status(404).send("User not found.");
                } else {
                  res.status(200).send(updatedUser);
                }
              })
              .catch((error) => {
                logger(ELogType.ERROR, `Error updating user: ${error}`);
                res.status(500).send("Error updating user.");
              });
            res.status(200).send(updatedClass);
          }
        })
        .catch((error) => {
          logger(ELogType.ERROR, `Error enrolling in class: ${error}`);
          res.status(500).send("Error enrolling in class.");
        });
    } else {
      res.status(401).send("User is not logged in.");
    }
  });

  router.put("/leaveClass", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const user = req.user as IUser;
      const classId = req.body.classId;
      Class.findByIdAndUpdate(
        classId,
        {
          $pull: { studentsIds: user._id },
        },
        { new: true }
      )
        .then((updatedClass) => {
          if (!updatedClass) {
            res.status(404).send("Class not found.");
          } else {
            User.findByIdAndUpdate(
              user._id,
              {
                $pull: { classes: classId },
              },
              { new: true }
            )
              .then((updatedUser) => {
                if (!updatedUser) {
                  res.status(404).send("User not found.");
                } else {
                  res.status(200).send(updatedUser);
                }
              })
              .catch((error) => {
                logger(ELogType.ERROR, `Error updating user: ${error}`);
                res.status(500).send("Error updating user.");
              });
            res.status(200).send(updatedClass);
          }
        })
        .catch((error) => {
          logger(ELogType.ERROR, `Error leaving class: ${error}`);
          res.status(500).send("Error leaving class.");
        });
    }
    else {
      res.status(401).send("User is not logged in.");
    }
  }
  );
  return router;
};
