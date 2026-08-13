import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";
import { Role } from "./store.service";
import { StoreService } from "./store.service";

@Injectable()
export class InvitationService {
  constructor(private readonly store: StoreService, private readonly auth: AuthService) {}

  create(senderId: string, input: { name: string; email: string; invitedRole?: Role; message?: string; expiresAt: string }) {
    const expiresAt = new Date(input.expiresAt);
    if (Number.isNaN(expiresAt.valueOf()) || expiresAt <= new Date()) throw new BadRequestException("Escolha uma data futura para expiração.");
    const invitation = this.store.createInvitation({ senderId, ...input, expiresAt: expiresAt.toISOString() });
    const acceptanceUrl = `${process.env.FRONTEND_URL ?? "http://127.0.0.1:5173"}/?invite=${invitation.token}`;
    console.log(`Convite para ${invitation.email}: ${acceptanceUrl}`);
    return { ...this.publicInvitation(invitation), acceptanceUrl };
  }

  preview(token: string) {
    const invitation = this.store.findInvitation(token);
    if (!invitation) throw new NotFoundException("Convite não encontrado.");
    return this.publicInvitation(invitation);
  }

  async accept(token: string, input: { name: string; email: string; password: string }) {
    const invitation = this.store.findInvitation(token);
    if (!invitation) throw new NotFoundException("Convite não encontrado.");
    if (invitation.status !== "enviado") throw new BadRequestException(`Este convite está ${invitation.status}.`);
    if (invitation.email.toLowerCase() !== input.email.toLowerCase()) throw new BadRequestException("Use o mesmo e-mail para o qual o convite foi enviado.");

    let user = this.store.findUserByEmail(input.email);
    if (!user) {
      user = this.store.createUser({
        name: input.name,
        email: input.email,
        passwordHash: await bcrypt.hash(input.password, 12),
        role: invitation.invitedRole ?? "cliente",
        roles: [invitation.invitedRole ?? "cliente"],
        emailVerified: true,
      });
    } else if (invitation.invitedRole) {
      this.store.addRoleToUser(user.id, invitation.invitedRole);
    }
    const accepted = this.store.acceptInvitation(token, user.id);
    if (!accepted) throw new BadRequestException("Não foi possível aceitar este convite.");
    return { message: "Convite aceito com sucesso.", session: this.auth.session(user) };
  }

  private publicInvitation(invitation: { id: string; token: string; name: string; email: string; message?: string; expiresAt: string; status: string }) {
    return { id: invitation.id, token: invitation.token, name: invitation.name, email: invitation.email, message: invitation.message, expiresAt: invitation.expiresAt, status: invitation.status };
  }
}