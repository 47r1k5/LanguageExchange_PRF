import { Router, Request, Response } from "express";
import { PassportStatic } from "passport";
import { User, IUser } from "../model/User";
import { ERole } from "../enums/ERole";
import { Pair } from "../model/Pair";
import { Log } from "../model/Log";
import { ELogType } from "../enums/ELogType";
import { logger } from "../middleware/logger";
import { isAdmin, isMentor } from "../middleware/autorization";
import { Class } from "../model/Class";

export const configureAdminRoutes = (
  passport: PassportStatic,
  router: Router
): Router => {
  router.get(
    "/getAllUsers",
    isAdmin,
    isMentor,
    (req: Request, res: Response) => {
      const user = req.user as IUser;
      User.find({ role: ERole.USER })
        .then((users) => {
          if (!users) {
            res.status(404).send("No users found.");
          } else {
            res.status(200).send(users);
          }
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send(error);
        });
    }
  );



  router.get(
    "/getUsersByKnownLanguage",
    isAdmin,
    isMentor,
    (req: Request, res: Response) => {
      if (req.isAuthenticated()) {
        const user = req.user as IUser;
        if (user.role === "admin") {
          const language = req.body.language as string;
          User.find({ role: ERole.USER })
            .then((users) => {
              if (!users) {
                res.status(404).send("No users found.");
              } else {
                const filteredUsers = users.filter((u) =>
                  u.languages_known?.includes(language)
                );
                res.status(200).send(filteredUsers);
              }
            })
            .catch((error) => {
              console.log(error);
              res.status(500).send(error);
            });
        } else {
          res.status(403).send("User is not authorized.");
        }
      }
    }
  );

  router.get(
    "/getUsersByLearningLanguage",
    isAdmin,
    isMentor,
    (req: Request, res: Response) => {
      if (req.isAuthenticated()) {
        const user = req.user as IUser;
        if (user.role === "admin") {
          const language = req.body.language as string;
          User.find({ role: ERole.USER, language_learning: language })
            .then((users) => {
              if (!users) {
                res.status(404).send("No users found.");
              } else {
                res.status(200).send(users);
              }
            })
            .catch((error) => {
              res.status(500).send(error);
            });
        } else {
          res.status(403).send("User is not authorized.");
        }
      }
    }
  );

  router.get(
    "/getAllPairs",
    isAdmin,
    isMentor,
    (req: Request, res: Response) => {
      const user = req.user as IUser;
      Pair.find()
        .then((pairs) => {
          if (!pairs) {
            res.status(404).send("No pairs found.");
          } else {
            logger(ELogType.INFO, `Admin ${user.email} requested all pairs.`);
            res.status(200).send(pairs);
          }
        })
        .catch((error) => {
          console.log(error);
          logger(
            ELogType.ERROR,
            `Error getting all pairs by ${user.email}: ${error}`
          );
        });
    }
  );

  router.post("/deleteUser", isAdmin, (req: Request, res: Response) => {
    const user = req.user as IUser;
    const userId = req.body.userId;
    User.findByIdAndDelete(userId)
      .then((deletedUser) => {
        if (!deletedUser) {
          logger(
            ELogType.WARNING,
            `Admin ${user.email} attempted to delete non-existing user ${userId}.`
          );
          res.status(404).send("User not found.");
        } else {
          Pair.findOneAndDelete({
            $or: [{ userA: userId }, { userB: userId }],
          }).then((deletedPair) => {
            if (deletedPair) {
              logger(
                ELogType.INFO,
                `Admin ${user.email} deleted ${userId} user and ${deletedPair._id} pair.`
              );
            } else {
              logger(
                ELogType.INFO,
                `Admin ${user.email} deleted user ${userId} without any pairs.`
              );
            }
            res.status(200).send("User deleted successfully.");
          });
        }
      })
      .catch((error) => {
        logger(
          ELogType.ERROR,
          `Error deleting user ${userId} by ${user.email}: ${error}`
        );
        res.status(500).send(error);
      });
  });

  router.post(
    "/createPair",
    isAdmin,
    isMentor,
    (req: Request, res: Response) => {
      const user = req.user as IUser;

      const { userA, userB, languageA, languageB } = req.body;

      try {
        const pair = new Pair({ userA, userB, languageA, languageB });
        const savedPair = pair.save();

        logger(
          ELogType.INFO,
          `Admin ${user.email} created a pair between ${userA} and ${userB} (${languageA} ⇄ ${languageB}).`
        );
        res.status(200).send(savedPair);
      } catch (error) {
        console.error(error);
        logger(
          ELogType.ERROR,
          `Error creating pair by ${user.email}: ${error}`
        );
        res.status(500).send("Internal server error.");
      }
    }
  );

  router.post(
    "/deletePair",
    isAdmin,
    isMentor,
    (req: Request, res: Response) => {
      const user = req.user as IUser;
      const pairId = req.body.pairId;
      Pair.findByIdAndDelete(pairId)
        .then((deletedPair) => {
          if (!deletedPair) {
            logger(
              ELogType.WARNING,
              `Admin ${user.email} attempted to delete non-existing pair ${pairId}.`
            );
            res.status(404).send("Pair not found.");
          } else {
            logger(
              ELogType.INFO,
              `Admin ${user.email} deleted pair ${pairId}.`
            );
            res.status(200).send("Pair deleted successfully.");
          }
        })
        .catch((error) => {
          console.log(error);
          logger(
            ELogType.ERROR,
            `Error deleting pair ${pairId} by ${user.email}: ${error}`
          );
          res.status(500).send(error);
        });
    }
  );

  router.get("/getAllLogs", isAdmin, (req: Request, res: Response) => {
    const user = req.user as IUser;
    Log.find()
      .then((logs) => {
        res.status(200).send(logs);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send(error);
      });
  });

  router.get("/getRecentLogs", isAdmin, (req: Request, res: Response) => {
    const user = req.user as IUser;

    Log.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .then((logs) => {
        res.status(200).send(logs);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send(error);
      });
  });

  router.get("/getLogsByType", (req: Request, res: Response) => {
    const user = req.user as IUser;
    const logType = req.body.type as string;
    Log.find({ type: logType })
      .then((logs) => {
        res.status(200).send(logs);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send(error);
      });
  });

  router.post("/createMentor", isAdmin, (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { first_name, last_name, email, password, languages_known } =
      req.body;
    const mentor = new User({
      first_name,
      last_name,
      email,
      password,
      languages_known,
      role: ERole.MENTOR,
    });
    mentor
      .save()
      .then((savedMentor) => {
        logger(
          ELogType.INFO,
          `Admin ${user.email} created a mentor ${savedMentor._id}.`
        );
        res.status(200).send(savedMentor);
      })
      .catch((error) => {
        console.log(error);
        logger(
          ELogType.ERROR,
          `Error creating mentor by ${user.email}: ${error}`
        );
        res.status(500).send("Internal server error.");
      });
  });

  router.post("/deleteMentor", isAdmin, (req: Request, res: Response) => {
    const user = req.user as IUser;
    const mentorId = req.body.mentorId;
    User.findByIdAndDelete(mentorId)
      .then((deletedMentor) => {
        if (!deletedMentor) {
          logger(
            ELogType.WARNING,
            `Admin ${user.email} attempted to delete non-existing mentor ${mentorId}.`
          );
          res.status(404).send("Mentor not found.");
        } else {
          Class.find({ mentor: mentorId })
            .then((classes) => {
              classes.forEach((classItem) => {
                classItem.studentsIds.forEach((studentId) => {
                  User.findByIdAndUpdate(studentId, {
                    $pull: { classes: classItem._id },
                  })
                    .then((updatedUser) => {
                      if (!updatedUser) {
                        logger(
                          ELogType.WARNING,
                          `Admin ${user.email} attempted to update non-existing user ${studentId}.`
                        );
                      } else {
                        logger(
                          ELogType.INFO,
                          `Admin ${user.email} removed class ${classItem._id} from user ${studentId}.`
                        );
                      }
                    })
                    .catch((error) => {
                      console.log(error);
                      logger(
                        ELogType.ERROR,
                        `Error updating user ${studentId} by ${user.email}: ${error}`
                      );
                    });
                });
                Class.findByIdAndDelete(classItem._id).then((deletedClass) => {
                  if (!deletedClass) {
                    logger(
                      ELogType.WARNING,
                      `Admin ${user.email} attempted to delete non-existing class ${classItem._id}.`
                    );
                  } else {
                    logger(
                      ELogType.INFO,
                      `Admin ${user.email} deleted class ${classItem._id} by deleting mentor ${mentorId}.`
                    );
                  }
                });
              });
            })
            .catch((error) => {
              console.log(error);
              logger(
                ELogType.ERROR,
                `Error deleting classes by ${user.email}: ${error}`
              );
            });
          logger(
            ELogType.INFO,
            `Admin ${user.email} deleted mentor ${mentorId}.`
          );
          res.status(200).send("Mentor deleted successfully.");
        }
      })
      .catch((error) => {
        logger(
          ELogType.ERROR,
          `Error deleting mentor ${mentorId} by ${user.email}: ${error}`
        );
        res.status(500).send(error);
      });
  });

  router.get("/getClassByTeacherId", isAdmin, (req: Request, res: Response) => {
    const user = req.user as IUser;
    const teacherId = req.body.teacherId;
    Class.find({ teacherId: teacherId })
      .then((classes) => {
        if (!classes) {
          res.status(404).send("No classes found.");
        } else {
          logger(
            ELogType.INFO,
            `Admin ${user.email} requested classes by teacher ${teacherId}.`
          );
          res.status(200).send(classes);
        }
      })
      .catch((error) => {
        console.log(error);
        logger(
          ELogType.ERROR,
          `Error getting classes by teacher ${teacherId} by ${user.email}: ${error}`
        );
      });
  });

  return router;
};
