import {ELogType} from "../enums/ELogType";
import { Log } from "../model/Log";

export const logger = (type: ELogType, message: string): void => {
    Log.create({ type, message }).catch(() =>
      console.error(`Failed to log: ${type} - ${message}`)
    );
  };