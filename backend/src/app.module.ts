import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { BureauIAController } from "./bureauia.controller";
import { BureauIAService } from "./bureauia.service";
import { InvitationController } from "./invitation.controller";
import { InvitationService } from "./invitation.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { StoreService } from "./store.service";

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET ?? "bureauflow-local-development-secret", signOptions: { expiresIn: "8h" } })],
  controllers: [AuthController, InvitationController, BureauIAController],
  providers: [StoreService, AuthService, InvitationService, BureauIAService, JwtAuthGuard],
})
export class AppModule {}