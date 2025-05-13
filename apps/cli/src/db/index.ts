import { Database } from "@director.run/gateway/db/index";
import { env } from "../config";

export const db = await Database.connect(env.DB_FILE_PATH);
