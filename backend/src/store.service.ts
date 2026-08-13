import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

export type Role = "advogado" | "escritorio" | "despachante" | "empresa" | "cliente";
export type InvitationStatus = "enviado" | "aceito" | "expirado" | "cancelado";
export type AddressType = "RESIDENTIAL" | "PROFESSIONAL" | "COMMERCIAL";
export type ContactType = "EMAIL" | "PHONE" | "MOBILE" | "WHATSAPP";
export type ProcessParticipantRole = "CLIENT" | "LAWYER" | "LEGAL_REPRESENTATIVE" | "PARTY" | "WITNESS" | "RESPONSIBLE" | "OTHER";
export type LegalRepresentationType = "LEGAL_REPRESENTATIVE" | "AUTO_REPRESENTANTE_LEGAL";

export interface StoredAddress {
  id?: string;
  ownerType?: "user" | "organization";
  ownerId?: string;
  type?: AddressType;
  zipCode?: string;
  country?: string;
  state?: string;
  city?: string;
  district?: string;
  street?: string;
  number?: string;
  complement?: string;
  reference?: string;
  main?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoredContact {
  id: string;
  ownerType: "user" | "organization";
  ownerId: string;
  type: ContactType;
  value: string;
  main: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  personalAddress?: StoredAddress;
  workAddress?: StoredAddress;
  capabilities?: {
    canActAsLegalRepresentative: boolean;
    isAutonomous: boolean;
  };
  roles: Role[];
  emailVerified: boolean;
  createdAt: string;
}

export interface StoredOrganization {
  id: string;
  ownerId: string;
  name: string;
  document: string;
  address?: string;
  workAddress?: StoredAddress;
  phone?: string;
  responsibleName?: string;
  responsibleEmail?: string;
  responsibleCpf?: string;
  responsibleRole?: string;
  representativeRule?: string;
}

export interface StoredOrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  relation: "owner" | "representante" | "advogado" | "colaborador" | "gestor" | "representante_legal";
  linkedAt: string;
}

export interface StoredPendingOrganizationMember {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  cpf?: string;
  profile: "advogado" | "colaborador" | "gestor" | "representante_legal";
  phone?: string;
  roleTitle?: string;
  oab?: string;
  section?: string;
  createdAt: string;
}

export interface StoredInvitation {
  id: string;
  token: string;
  senderId: string;
  recipientId?: string;
  name: string;
  email: string;
  invitedRole?: Role;
  message?: string;
  expiresAt: string;
  status: InvitationStatus;
}

export interface StoredProcess {
  id: string;
  code: string;
  name: string;
  organizationId?: string;
  createdByUserId: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface StoredProcessParticipant {
  id: string;
  processId: string;
  userId: string;
  organizationId?: string;
  role: ProcessParticipantRole;
  active: boolean;
  enteredAt: string;
  exitedAt?: string;
  replacedByParticipantId?: string;
  replacementReason?: string;
  representationType?: LegalRepresentationType;
}

@Injectable()
export class StoreService {
  private readonly users = new Map<string, StoredUser>();
  private readonly organizations = new Map<string, StoredOrganization>();
  private readonly addresses = new Map<string, StoredAddress>();
  private readonly contacts = new Map<string, StoredContact>();
  private readonly organizationMembers = new Map<string, StoredOrganizationMember>();
  private readonly pendingOrganizationMembers = new Map<string, StoredPendingOrganizationMember>();
  private readonly verificationTokens = new Map<string, { userId: string; channel: "email" | "whatsapp"; destination: string; expiresAt: string; used: boolean }>();
  private readonly invitations = new Map<string, StoredInvitation>();
  private readonly processes = new Map<string, StoredProcess>();
  private readonly processParticipants = new Map<string, StoredProcessParticipant>();

  createUser(input: Omit<StoredUser, "id" | "createdAt">) {
    const user: StoredUser = {
      ...input,
      id: randomUUID(),
      roles: input.roles.length ? [...new Set(input.roles)] : [input.role],
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    return user;
  }

  addRoleToUser(userId: string, role: Role) {
    const user = this.users.get(userId);
    if (!user) return undefined;
    if (!user.roles.includes(role)) user.roles.push(role);
    return user;
  }

  listRolesByUser(userId: string) {
    const user = this.users.get(userId);
    return user?.roles ?? [];
  }

  userHasRole(userId: string, role: Role) {
    const user = this.users.get(userId);
    if (!user) return false;
    return user.roles.includes(role) || user.role === role;
  }

  findUserByEmail(email: string) {
    return [...this.users.values()].find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  findUserByDocument(document: string) {
    return [...this.users.values()].find((user) => user.document === document);
  }

  findUsersByDocument(document: string) {
    return [...this.users.values()].filter((user) => user.document === document);
  }

  hasRoleByDocument(document: string, role: Role) {
    return [...this.users.values()].some((user) => user.document === document && (user.role === role || user.roles.includes(role)));
  }

  findUserByEmailOrDocument(email: string, document?: string) {
    const byEmail = this.findUserByEmail(email);
    if (byEmail) return byEmail;
    if (document) return this.findUserByDocument(document);
    return undefined;
  }

  findLawyer(email?: string, cpf?: string, oab?: string, name?: string) {
    const normalizedName = name?.trim().toLowerCase();
    const users = [...this.users.values()];
    return users.find((user) => {
      if (email && user.email.toLowerCase() !== email.toLowerCase()) return false;
      if (cpf && user.document !== cpf) return false;
      if (oab && user.oab?.replace(/\D/g, "") !== oab) return false;
      if (normalizedName && !user.name.toLowerCase().includes(normalizedName)) return false;
      if (!email && !cpf && !oab && !normalizedName) return false;
      return user.role === "advogado" || user.roles.includes("advogado") || !!user.oab;
    });
  }

  findMember(email?: string, cpf?: string, name?: string) {
    const normalizedName = name?.trim().toLowerCase();
    if (!email && !cpf && !normalizedName) return undefined;
    return [...this.users.values()].find((user) => {
      if (email && user.email.toLowerCase() !== email.toLowerCase()) return false;
      if (cpf && user.document !== cpf) return false;
      if (normalizedName && !user.name.toLowerCase().includes(normalizedName)) return false;
      return true;
    });
  }

  findUserById(id: string) {
    return this.users.get(id);
  }

  createAddress(input: Omit<StoredAddress, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const id = randomUUID();
    const address: StoredAddress = {
      ...input,
      id,
      active: input.active ?? true,
      main: input.main ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.addresses.set(id, address);
    return address;
  }

  listAddresses(ownerType: "user" | "organization", ownerId: string) {
    return [...this.addresses.values()].filter((address) => address.ownerType === ownerType && address.ownerId === ownerId && address.active !== false);
  }

  createContact(input: Omit<StoredContact, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const contact: StoredContact = {
      ...input,
      id: randomUUID(),
      active: input.active ?? true,
      main: input.main ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.contacts.set(contact.id, contact);
    return contact;
  }

  listContacts(ownerType: "user" | "organization", ownerId: string) {
    return [...this.contacts.values()].filter((contact) => contact.ownerType === ownerType && contact.ownerId === ownerId && contact.active !== false);
  }

  verifyUser(id: string) {
    const user = this.users.get(id);
    if (user) user.emailVerified = true;
    return user;
  }

  createVerificationToken(userId: string, channel: "email" | "whatsapp", destination: string) {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    this.verificationTokens.set(token, { userId, channel, destination, expiresAt, used: false });
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

  findOrganizationById(id: string) {
    return this.organizations.get(id);
  }

  findOrganizationByDocument(document: string) {
    return [...this.organizations.values()].find((organization) => organization.document === document);
  }

  linkUserToOrganization(input: Omit<StoredOrganizationMember, "id" | "linkedAt">) {
    const exists = [...this.organizationMembers.values()].find((member) => member.organizationId === input.organizationId && member.userId === input.userId && member.relation === input.relation);
    if (exists) return exists;
    const member: StoredOrganizationMember = {
      ...input,
      id: randomUUID(),
      linkedAt: new Date().toISOString(),
    };
    this.organizationMembers.set(member.id, member);
    return member;
  }

  addPendingOrganizationMember(input: Omit<StoredPendingOrganizationMember, "id" | "createdAt">) {
    const exists = [...this.pendingOrganizationMembers.values()].find((pending) => pending.organizationId === input.organizationId && pending.email.toLowerCase() === input.email.toLowerCase());
    if (exists) return exists;
    const pending: StoredPendingOrganizationMember = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.pendingOrganizationMembers.set(pending.id, pending);
    return pending;
  }

  consumePendingOrganizationMembers(user: Pick<StoredUser, "id" | "email" | "document">) {
    const matches = [...this.pendingOrganizationMembers.values()].filter((pending) => pending.email.toLowerCase() === user.email.toLowerCase() || (pending.cpf && user.document && pending.cpf === user.document));
    for (const pending of matches) {
      const relation = pending.profile === "advogado" ? "advogado" : pending.profile === "gestor" ? "gestor" : pending.profile === "colaborador" ? "colaborador" : "representante_legal";
      this.linkUserToOrganization({
        organizationId: pending.organizationId,
        userId: user.id,
        relation,
      });
      this.pendingOrganizationMembers.delete(pending.id);
    }
    return matches.length;
  }

  findOrganizationsByUser(userId: string) {
    return [...this.organizationMembers.values()]
      .filter((member) => member.userId === userId)
      .map((member) => {
        const organization = this.organizations.get(member.organizationId);
        if (!organization) return undefined;
        return {
          id: organization.id,
          name: organization.name,
          document: organization.document,
          relation: member.relation,
        };
      })
      .filter((item): item is { id: string; name: string; document: string; relation: "owner" | "representante" | "advogado" | "colaborador" | "gestor" | "representante_legal" } => !!item);
  }

  createProcess(input: Omit<StoredProcess, "id" | "code" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const process: StoredProcess = {
      ...input,
      id: randomUUID(),
      code: `BF-${Math.floor(Math.random() * 900000 + 100000)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.processes.set(process.id, process);
    return process;
  }

  findProcessById(id: string) {
    return this.processes.get(id);
  }

  listProcessesByUser(userId: string) {
    const memberships = new Set(this.findOrganizationsByUser(userId).map((item) => item.id));
    return [...this.processes.values()].filter((process) => process.createdByUserId === userId || (process.organizationId ? memberships.has(process.organizationId) : false));
  }

  addProcessParticipant(input: Omit<StoredProcessParticipant, "id" | "enteredAt" | "active">) {
    const now = new Date().toISOString();
    const participant: StoredProcessParticipant = {
      ...input,
      id: randomUUID(),
      enteredAt: now,
      active: true,
    };
    this.processParticipants.set(participant.id, participant);
    return participant;
  }

  listProcessParticipants(processId: string, activeOnly = false) {
    return [...this.processParticipants.values()].filter((participant) => participant.processId === processId && (!activeOnly || participant.active));
  }

  findActiveLegalRepresentative(processId: string) {
    return this.listProcessParticipants(processId, true).find((participant) => participant.role === "LEGAL_REPRESENTATIVE");
  }

  deactivateParticipant(participantId: string, reason: string, replacedByParticipantId?: string) {
    const participant = this.processParticipants.get(participantId);
    if (!participant || !participant.active) return undefined;
    participant.active = false;
    participant.exitedAt = new Date().toISOString();
    participant.replacementReason = reason;
    participant.replacedByParticipantId = replacedByParticipantId;
    return participant;
  }

  userBelongsToOrganization(userId: string, organizationId: string) {
    return [...this.organizationMembers.values()].some((member) => member.userId === userId && member.organizationId === organizationId);
  }

  resolveAutoRepresentation(processId: string, representativeUserId: string): LegalRepresentationType {
    const representative = this.findUserById(representativeUserId);
    if (!representative?.document) return "LEGAL_REPRESENTATIVE";
    const clientParticipant = this.listProcessParticipants(processId, true).find((participant) => participant.role === "CLIENT");
    if (!clientParticipant) return "LEGAL_REPRESENTATIVE";
    const client = this.findUserById(clientParticipant.userId);
    if (!client?.document) return "LEGAL_REPRESENTATIVE";
    const sameDocument = client.document === representative.document;
    const hasRepresentativeRole = this.userHasRole(representativeUserId, "despachante");
    if (sameDocument && hasRepresentativeRole) return "AUTO_REPRESENTANTE_LEGAL";
    return "LEGAL_REPRESENTATIVE";
  }

  upsertActiveLegalRepresentative(input: { processId: string; representativeUserId: string; organizationId?: string; replacementReason?: string }) {
    const previous = this.findActiveLegalRepresentative(input.processId);
    const representationType = this.resolveAutoRepresentation(input.processId, input.representativeUserId);
    const next = this.addProcessParticipant({
      processId: input.processId,
      userId: input.representativeUserId,
      organizationId: input.organizationId,
      role: "LEGAL_REPRESENTATIVE",
      representationType,
    });
    if (previous) {
      this.deactivateParticipant(previous.id, input.replacementReason ?? "Substituição de representante legal", next.id);
    }
    return { previous, next };
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