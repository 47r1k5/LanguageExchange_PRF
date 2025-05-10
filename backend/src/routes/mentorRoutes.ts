import { Router, Request, Response } from "express";
import { PassportStatic } from "passport";
import { IUser, User } from "../model/User";
import { ELogType } from "../enums/ELogType";
import { logger } from "../middleware/logger";
import { isMentor } from "../middleware/autorization";
import { Class } from "../model/Class";

export const configureMentorRoutes = (
  passport: PassportStatic,
  router: Router
): Router => {

router.post(
    "/createClass",
    isMentor,
    (req: Request, res: Response) => {
      const user = req.user as IUser;
      const {
        name,
        teacherId,
        description,
        space,
        loc,
        startDate,
        endDate,
        language,
        level,
      } = req.body;
      const classItem = new Class({
        name,
        description,
        language,
        level,
        space,
        startDate,
        endDate,
        loc,
        teacherId,
      });
      classItem
        .save()
        .then((savedClass) => {
          logger(
            ELogType.INFO,
            `${user.role} ${user.email} created a class ${savedClass._id}.`
          );
          res.status(200).send(savedClass);
        })
        .catch((error) => {
          console.log(error);
          logger(
            ELogType.ERROR,
            `Error creating class by ${user.email}: ${error}`
          );
          res.status(500).send("Internal server error.");
        });
    }
  );

  router.post(
    "/deleteClass",
    isMentor,
    (req: Request, res: Response) => {
      const user = req.user as IUser;
      const classId = req.body.classId;
      Class.findByIdAndDelete(classId)
        .then((deletedClass) => {
          if (!deletedClass) {
            logger(
              ELogType.WARNING,
              `${user.role} ${user.email} attempted to delete non-existing class ${classId}.`
            );
            res.status(404).send("Class not found.");
          } else {
            logger(
              ELogType.INFO,
              `${user.role} ${user.email} deleted class ${classId}.`
            );
            res.status(200).send("Class deleted successfully.");
          }
        })
        .catch((error) => {
          console.log(error);
          logger(
            ELogType.ERROR,
            `Error deleting class ${classId} by ${user.email}: ${error}`
          );
          res.status(500).send(error);
        });
    }
  );

  router.get(
    "/getAllClasses",
    isMentor,
    (req: Request, res: Response) => {
      const user = req.user as IUser;
      Class.find()
        .then((classes) => {
          if (!classes) {
            res.status(404).send("No classes found.");
          } else {
            logger(ELogType.INFO, `Admin ${user.email} requested all classes.`);
            res.status(200).send(classes);
          }
        })
        .catch((error) => {
          console.log(error);
          logger(
            ELogType.ERROR,
            `Error getting all classes by ${user.email}: ${error}`
          );
        });
    }
  );

  router.get("/getMyClasses", isMentor, (req: Request, res: Response) => {
    const user = req.user as IUser;
    Class.find({ teacherId: user._id })
      .then((classes) => {
        if (!classes) {
          res.status(404).send("No classes found.");
        } else {
          logger(ELogType.INFO, `${user.email} requested their classes.`);
          res.status(200).send(classes);
        }
      })
      .catch((error) => {
        console.log(error);
        logger(
          ELogType.ERROR,
          `Error getting classes by mentor ${user._id} by ${user.email}: ${error}`
        );
      });
  });

    router.get(
      "/getUsersById/:id",
      isMentor,
      (req: Request, res: Response) => {
        const user = req.user as IUser;
        const userId = req.params.id;
        User.findById(userId)
          .then((foundUser) => {
            if (!foundUser) {
              res.status(404).send("User not found.");
            } else {
              res.status(200).send(foundUser);
            }
          })
          .catch((error) => {
            console.log(error);
            res.status(500).send(error);
          });
      }
    );

  router.get(
    "/getClassById/:classId",
    isMentor,
    (req: Request, res: Response) => {
      const user = req.user as IUser;
      const classId = req.params.classId;
      Class.findById(classId)
        .then((classItem) => {
          if (!classItem) {
            res.status(404).send("Class not found.");
          } else {
            logger(
              ELogType.INFO,
              `${user.role} ${user.email} requested class ${classId}.`
            );
            res.status(200).send(classItem);
          }
        })
        .catch((error) => {
          console.log(error);
          logger(
            ELogType.ERROR,
            `Error getting class ${classId} by ${user.email}: ${error}`
          );
        });
    }
  );

  return router;
};