import { Router, Request, Response } from "express";
import { PassportStatic } from "passport";
import { IUser, User } from "../model/User";
import { ELogType } from "../enums/ELogType";
import { logger } from "../middleware/logger";
import { isMentor } from "../middleware/autorization";
import { Class } from "../model/Class";
import { ERole } from "../enums/ERole";

export const configureMentorRoutes = (
  passport: PassportStatic,
  router: Router
): Router => {
  router.post("/createClass", isMentor, (req: Request, res: Response) => {
    const user = req.user as IUser;
    const {
      name,
      description,
      free_space,
      loc,
      startDate,
      endDate,
      learn_language,
      speak_language,
      level,
    } = req.body;
    const classItem = new Class({
      name,
      description,
      learn_language,
      speak_language,
      level,
      free_space,
      startDate,
      endDate,
      loc,
      teacherId: user._id,
    });
    classItem
      .save()
      .then((savedClass) => {
        logger(
          ELogType.INFO,
          `${user.role} ${user.email} created a class ${savedClass._id}.`
        );
        res.status(200).send(savedClass);
        User.findByIdAndUpdate(user._id, {
          $push: { classes: savedClass._id },
        }).catch((error) => {
          console.log(error);
          logger(
            ELogType.ERROR,
            `Error adding class ${savedClass._id} to user ${user.email}: ${error}`
          );
          res.status(500).send("Internal server error.");
        });
      })
      .catch((error) => {
        console.log(error);
        logger(
          ELogType.ERROR,
          `Error creating class by ${user.email}: ${error}`
        );
        res.status(500).send("Internal server error.");
      });
  });

  router.post("/deleteClass/:id", isMentor, (req: Request, res: Response) => {
    const user = req.user as IUser;
    const classId = req.params.id;
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
  });

  router.put('/updateClass/:id', isMentor, (req: Request, res: Response) => {
    const user = req.user as IUser;
    const classId = req.params.id;
    const {
      name,
      description,
      free_space,
      loc,
      startDate,
      endDate,
      level,
    } = req.body;
    Class.findByIdAndUpdate(
      classId,
      {
        name,
        description,
        level,
        free_space,
        startDate,
        endDate,
        loc,
      },
      { new: true }
    )
      .then((updatedClass) => {
        if (!updatedClass) {
          res.status(404).send("Class not found.");
        } else {
          logger(
            ELogType.INFO,
            `${user.role} ${user.email} updated class ${classId}.`
          );
          res.status(200).send(updatedClass);
        }
      })
      .catch((error) => {
        console.log(error);
        logger(
          ELogType.ERROR,
          `Error updating class ${classId} by ${user.email}: ${error}`
        );
      });});

  router.get("/getAllClasses", isMentor, (req: Request, res: Response) => {
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
  });

  router.post(
    "/class/:id/kick/:studentId",
    isMentor,
    (req: Request, res: Response) => {
      const classId = req.params.id;
      const studentId = req.params.studentId;
      const user = req.user as IUser;
      Class.findByIdAndUpdate(
        classId,
        { $pull: { studentsIds: studentId }, $inc: { free_space: 1 } },
        { new: true }
      ).populate('studentsIds', 'first_name last_name email')
        .then((updatedClass) => {
          if (!updatedClass) {
            res.status(404).send("Class not found.");
          } else {
            logger(
              ELogType.INFO,
              `${user.role} ${user.email} kicked student ${studentId} from class ${classId}.`
            );
            res.status(200).send(updatedClass);
          }
        })
        .catch((error) => {
          console.log(error);
          logger(
            ELogType.ERROR,
            `Error kicking student ${studentId} from class ${classId} by ${user.email}: ${error}`
          );
        });
    }
  );

  router.get("/:id/classes", isMentor, (req: Request, res: Response) => {
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

  router.get("/getUsersById/:id", isMentor, (req: Request, res: Response) => {
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
  });

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
