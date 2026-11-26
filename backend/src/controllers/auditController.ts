import type { NextFunction, Request, Response } from "express";
import { AuditService } from "../services/auditService.ts";
import { getValidated } from "../middlewares/validate.ts";
import type { AuditQueryInput } from "../schemas/auditSchema.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";

export class AuditController {
  private auditService: AuditService;

  constructor(auditService: AuditService = new AuditService()) {
    this.auditService = auditService;
  }

  getAuditLogs = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = getValidated<AuditQueryInput>(res, "query");
      const data = await this.auditService.getAllAuditLogs(query);
      res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getAuditLogById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        throw new NotFoundError("Audit log tidak ditemukan");
      }
      const data = await this.auditService.getAuditLogById(id);
      res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
