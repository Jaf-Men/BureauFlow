import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { StoreService } from "./store.service";

export type AuthenticatedRequest = Request & { user: { id: string; email: string; role: string } };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly store: StoreService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) throw new UnauthorizedException("Informe um token de acesso.");
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      const user = this.store.findUserById(payload.sub);
      if (!user) throw new UnauthorizedException("Sessão inválida.");
      request.user = { id: user.id, email: user.email, role: user.role };
      return true;
    } catch {
      throw new UnauthorizedException("Sessão expirada ou inválida.");
    }
  }
}