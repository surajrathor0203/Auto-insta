import { connectDatabase } from "../src/config/database.js";
import { app } from "../src/app.js";

connectDatabase().catch(console.error);

export default app;
