import { Router } from "express";
import { AuditController } from "../controllers/auditController.ts";
import { authenticate, authorize } from "../middlewares/auth.ts";
import { validate } from "../middlewares/validate.ts";
import { auditQuerySchema } from "../schemas/auditSchema.ts";

const auditRouter = Router();
const auditController = new AuditController();

// Seluruh endpoint audit log hanya dapat diakses oleh role admin
auditRouter.use(authenticate, authorize("admin"));

auditRouter.get("/", validate(auditQuerySchema, "query"), auditController.getAuditLogs);
auditRouter.get("/:id", auditController.getAuditLogById);

export { auditRouter };
