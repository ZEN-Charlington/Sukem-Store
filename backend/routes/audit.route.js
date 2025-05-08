import express from "express";
import { getAuditLogs, deleteAuditLogs } from "../controllers/audit.controller.js";
import { protect } from "../middleware/authen.middleware.js";
import { checkRole } from "../middleware/checkRole.middleware.js";

const router = express.Router();

router.get("/", protect, checkRole(["manager"]), getAuditLogs);
router.delete("/", protect, checkRole(["manager"]), deleteAuditLogs);

export default router;