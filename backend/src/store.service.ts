import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

export type Role = "advogado" | "escritorio" | "cliente";
export type InvitationStatus = "enviado" | "aceito" | "expirado" | "cancelado";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  phone?: string;
  document?: string;
  oab?: string;
  section?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface StoredOrganization {
  id: string;
  ownerId: string;
  name: string;
  document: string;
  address?: string;
  phone?: string;
  responsibleName: string;
  responsibleEmail: string;
  lawyers: Array<{ name: string; email: string; oab: string; section: string }>;
}

export interface StoredInvitation {
  id: string;
  token: string;
  senderId: string;
  recipientId?: string;
  name: string;
  email: string;
  message?: string;
  expiresAt: string;
  status: InvitationStatus;
}

@Injectable()
export class StoreService {
  private readonly users = new Map<string, StoredUser>();
  private readonly organizations = new Map<string, StoredOrganization>();
  private readonly verificationTokens = new Map<string, { userId: string; expiresAt: string; used: boolean }>();
  private readonly invitations = new Map<string, StoredInvitation>();

  createUser(input: Omit<StoredUser, "id" | "createdAt">) {
    const user: StoredUser = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    this.users.set(user.id, user);
    return user;
  }

  findUserByEmail(email: string) {
    return [...this.users.values()].find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    return this.users.get(id);
  }

  verifyUser(id: string) {
    const user = this.users.get(id);
    if (user) user.emailVerified = true;
    return user;
  }

  createVerificationToken(userId: string) {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    this.verificationTokens.set(token, { userId, expiresAt, used: false });
    return token;
  }

  consumeVerificationToken(token: string) {
    const item = this.verificationTokens.get(token);
    if (!item || item.used || new Date(item.expiresAt) < new Date()) return undefined;
    item.used = true;
    return this.verifyUser(item.userId);
  }

  createOrganization(input: Omit<StoredOrganization, "id">) {
    const organization = { ...input, id: randomUUID() };
    this.organizations.set(organization.id, organization);
    return organization;
  }

  createInvitation(input: Omit<StoredInvitation, "id" | "token" | "status">) {
    const invitation: StoredInvitation = { ...input, id: randomUUID(), token: randomUUID(), status: "enviado" };
    this.invitations.set(invitation.token, invitation);
    return invitation;
  }

  findInvitation(token: string) {
    const invitation = this.invitations.get(token);
    if (invitation?.status === "enviado" && new Date(invitation.expiresAt) < new Date()) invitation.status = "expirado";
    return invitation;
  }

  acceptInvitation(token: string, recipientId: string) {
    const invitation = this.findInvitation(token);
    if (!invitation || invitation.status !== "enviado") return undefined;
    invitation.status = "aceito";
    invitation.recipientId = recipientId;
    return invitation;
  }
}