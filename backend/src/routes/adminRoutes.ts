import { Router, Request, Response } from "express";
import { PassportStatic } from "passport";
import { User, IUser } from "../model/User";
import { ERole } from "../enums/ERole";
import { Log } from "../model/Log";
import { ELogType } from "../enums/ELogType";
import { logger } from "../middleware/logger";
import { isAdmin, isMentor } from "../middleware/autorization";
import { Class } from "../model/Class";
import { Language } from "../model/Language";

export const configureAdminRoutes = (
  passport: PassportStatic,
  router: Router
): Router => {
  router.get("/users", isAdmin, (req: Request, res: Response) => {
    User.find({ role: "user" })
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((error) => {
        logger(ELogType.ERROR, `Error fetching users on admin: ${error}`);
        res.status(500).send(error);
      });
  });

  router.get("/mentors", isAdmin, (req: Request, res: Response) => {
    User.find({ role: "mentor" })
      .then((mentors) => {
        res.status(200).json(mentors);
      })
      .catch((error) => {
        logger(ELogType.ERROR, `Error fetching mentors on admin: ${error}`);
        res.status(500).send(error);
      });
  });

  router.get("/classes", isAdmin, (req: Request, res: Response) => {
    Class.find().populate("teacherId","first_name last_name")
      .then((classes) => {
        res.status(200).json(classes);
      })
      .catch((error) => {
        logger(ELogType.ERROR, `Error fetching classes on admin: ${error}`);
        res.status(500).send(error);
      });
  });

  router.delete("class/:id", isAdmin, (req: Request, res: Response) => {
    const classId = req.params.id;
    const user = req.user as IUser;
    Class.findByIdAndDelete(classId)
      .then((deletedClass) => {
        if (!deletedClass) {
          logger(
            ELogType.WARNING,
            `Admin ${user.email} attempted to delete non-existing class ${classId}.`
          );
          res.status(404).send("Class not found.");
        } else {
          res.status(200).send("Class deleted successfully.");
        }
      })
      .catch((error) => {
        logger(
          ELogType.ERROR,
          `Error deleting class ${classId} by ${user.email}: ${error}`
        );
        res.status(500).send(error);
      });
  });

  router.delete("/users/:id", isAdmin, (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = req.user as IUser;
    User.findByIdAndDelete(userId)
      .then((deletedUser) => {
        if (!deletedUser) {
          logger(
            ELogType.WARNING,
            `Admin ${user.email} attempted to delete non-existing user ${userId}.`
          );
          res.status(404).send("User not found.");
        } else {
          if (deletedUser.role === "mentor") {
            Class.deleteMany({ teacherId: userId }).catch((error) => {
              logger(
                ELogType.ERROR,
                `Error deleting class user ${userId}: ${error}`
              );
              res.status(500).send(error);
            });
          }else{
            Class.updateMany({studentsIds:userId},
              { $pull: { studentsIds: userId }, $inc: { free_space: 1 } },
              { new: true }
            )
          }
          res.status(200).send("User deleted successfully.");
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

  router.delete("/languages/:lang",isAdmin, (req: Request, res: Response) => {
    const lang = req.params.lang;
    const user = req.user as IUser;
    Language.deleteOne({name:lang})
      .then((deletedClass) => {
        if (!deletedClass) {
          logger(
            ELogType.WARNING,
            `Admin ${user.email} attempted to delete non-existing language ${lang}.`
          );
          res.status(404).send("Lang not found.");
        } else {
          res.status(200).send("Lang deleted successfully.");
        }
      })
      .catch((error) => {
        logger(
          ELogType.ERROR,
          `Error deleting ${lang} language by ${user.email}: ${error}`
        );
        res.status(500).send(error);
      });
  });

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

  router.get("/logs", isAdmin, (req: Request, res: Response) => {
    const user = req.user as IUser;

    Log.find()
      .sort({ createdAt: -1 })
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
    const { first_name, last_name, email, password, languages_known, bio } =
      req.body;
    const mentor = new User({
      first_name,
      last_name,
      email,
      password,
      languages_known,
      languages_learning:[],
      bio,
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

  router.post("/addLanguage", isAdmin, (req: Request, res: Response) => {
    const user = req.user as IUser;
    const language = req.body.language as string;
    let lang = new Language({ name: language });
    lang
      .save()
      .then((savedLanguage) => {
        logger(
          ELogType.INFO,
          `Admin ${user.email} created a language ${savedLanguage.name}.`
        );
        res.status(200).send(savedLanguage);
      })
      .catch((error) => {
        console.log(error);
        logger(
          ELogType.ERROR,
          `Error creating language by ${user.email}: ${error}`
        );
        res.status(500).send("Internal server error.");
      });
  });

  return router;
};
