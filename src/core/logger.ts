import {forArea, ILoggerArea} from "complog";

export const appLogger: ILoggerArea = forArea("t-count");
appLogger.enable(false);
