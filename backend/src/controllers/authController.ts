import type { Request, Response } from "express";
import { AuthService } from "../services/authService.ts";
import { getValidated } from "../middlewares/validate.ts";
import type { LoginInput, RegisterInput } from "../schemas/authSchema.ts";
import type { AuthUser } from "../services/tokenService.ts";

function getClientMeta(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const ipAddress =
    typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : req.ip || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = (req.headers["user-agent"] as string) || "Unknown";
  return { ipAddress, userAgent };
}

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService = new AuthService()) {
    this.authService = authService;
  }

  register = async (_req: Request, res: Response): Promise<void> => {
    const body = getValidated<RegisterInput>(res, "body");
    const user = await this.authService.register(body);
    res.status(201).json({ status: "success", data: { user } });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const body = getValidated<LoginInput>(res, "body");
    const meta = getClientMeta(req);
    const data = await this.authService.login(body, meta);
    res.status(200).json({ status: "success", data });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const user = res.locals.authUser as AuthUser;
    const meta = getClientMeta(req);
    await this.authService.logout(user, meta);
    res.status(200).json({ status: "success", message: "Logout berhasil" });
  };

  me = (_req: Request, res: Response): void => {
    const user = res.locals.authUser as AuthUser;
    res.status(200).json({ status: "success", data: { user } });
  };
}
