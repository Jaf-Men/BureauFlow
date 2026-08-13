import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { Role, StoreService, type StoredAddress } from "./store.service";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  verificationChannel: "email" | "whatsapp";
  phone?: string;
  document?: string;
  oab?: string;
  section?: string;
  personalAddress?: StoredAddress;
  workAddress?: StoredAddress;
  legalRepresentativeTrack?: "cliente" | "despachante";
  organization?: {
    name: string;
    document: string;
    address?: string;
    workAddress?: StoredAddress;
    phone?: string;
    responsibleName?: string;
    responsibleCpf?: string;
    responsibleRole?: string;
    responsibleEmail?: string;
    lawyers?: Array<{ name: string; email: string; cpf?: string; oab: string; section: string }>;
    teamMembers?: Array<{
      name: string;
      email: string;
      cpf?: string;
      profile: "advogado" | "colaborador" | "gestor" | "representante_legal";
      phone?: string;
      roleTitle?: string;
      oab?: string;
      section?: string;
    }>;
  };
}

@Injectable()
export class AuthService {
  constructor(private readonly store: StoreService, private readonly jwt: JwtService) {}

  private hasAddress(address?: StoredAddress) {
    if (!address) return false;
    return Boolean(address.zipCode || address.state || address.city || address.district || address.street || address.number || address.complement || address.reference);
  }

  async register(input: RegisterInput) {
    const isOrganizationAccount = input.role === "escritorio" || input.role === "empresa";
    const isAutonomous = input.role === "advogado" || input.role === "despachante";
    if (this.store.findUserByEmail(input.email)) throw new BadRequestException("Este e-mail já está cadastrado.");
    if (isOrganizationAccount && !input.organization) throw new BadRequestException("Informe os dados da organização.");
    if (input.verificationChannel === "whatsapp" && !input.phone) throw new BadRequestException("Informe um telefone com WhatsApp para confirmar o cadastro por este canal.");
    if (isOrganizationAccount && input.organization && this.store.findOrganizationByDocument(input.organization.document)) {
      throw new BadRequestException("Este CNPJ já está cadastrado no sistema.");
    }

    if (!this.hasAddress(input.personalAddress)) {
      throw new BadRequestException("Cadastro exige endereço individual para todos os perfis.");
    }
    if (isAutonomous && !this.hasAddress(input.workAddress)) {
      throw new BadRequestException("Advogado autônomo e Representante legal (despachante) autônomo devem informar endereço de trabalho.");
    }
    if (isOrganizationAccount && !this.hasAddress(input.organization?.workAddress) && !input.organization?.address) {
      throw new BadRequestException("Empresa e escritório devem informar endereço de trabalho.");
    }

    const normalizedDocument = input.document?.replace(/\D/g, "");
    const isClientSelfRepresentative = Boolean(normalizedDocument && input.role === "despachante" && this.store.hasRoleByDocument(normalizedDocument, "cliente"));
    const isRepresentativeAlsoClient = Boolean(normalizedDocument && input.role === "cliente" && this.store.hasRoleByDocument(normalizedDocument, "despachante"));

    const user = this.store.createUser({
      name: isOrganizationAccount ? (input.organization?.responsibleName ?? input.organization?.name ?? input.name) : input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: input.role,
      roles: [input.role],
      phone: input.phone,
      document: input.document,
      oab: input.oab,
      section: input.section,
      personalAddress: input.personalAddress,
      workAddress: input.workAddress,
      capabilities: {
        canActAsLegalRepresentative: input.role === "despachante" || input.role === "advogado" || isRepresentativeAlsoClient,
        isAutonomous,
      },
      emailVerified: false,
    });

    if (user.personalAddress) {
      this.store.createAddress({
        ...user.personalAddress,
        ownerType: "user",
        ownerId: user.id,
        type: "RESIDENTIAL",
        main: true,
      });
    }
    if (user.workAddress) {
      this.store.createAddress({
        ...user.workAddress,
        ownerType: "user",
        ownerId: user.id,
        type: "PROFESSIONAL",
        main: true,
      });
    }
    if (user.email) {
      this.store.createContact({
        ownerType: "user",
        ownerId: user.id,
        type: "EMAIL",
        value: user.email,
        main: true,
        active: true,
      });
    }
    if (user.phone) {
      this.store.createContact({
        ownerType: "user",
        ownerId: user.id,
        type: "WHATSAPP",
        value: user.phone,
        main: false,
        active: true,
      });
    }

    let linkedLawyers = 0;
    let pendingLawyers = 0;
    let linkedTeamMembers = 0;
    let pendingTeamMembers = 0;

    if (input.organization) {
      const organization = this.store.createOrganization({
        ownerId: user.id,
        name: input.organization.name,
        document: input.organization.document,
        address: input.organization.address,
        workAddress: input.organization.workAddress,
        phone: input.organization.phone,
        responsibleName: input.organization.responsibleName,
        responsibleEmail: input.organization.responsibleEmail,
        responsibleCpf: input.organization.responsibleCpf,
        responsibleRole: input.organization.responsibleRole,
        representativeRule: "Um processo só pode receber um representante legal. O representante pode ser da equipe ou autônomo externo.",
      });

      if (input.organization.workAddress) {
        this.store.createAddress({
          ...input.organization.workAddress,
          ownerType: "organization",
          ownerId: organization.id,
          type: "COMMERCIAL",
          main: true,
        });
      }
      if (input.organization.phone) {
        this.store.createContact({
          ownerType: "organization",
          ownerId: organization.id,
          type: "PHONE",
          value: input.organization.phone,
          main: true,
          active: true,
        });
      }

      this.store.linkUserToOrganization({ organizationId: organization.id, userId: user.id, relation: "owner" });

      for (const member of input.organization.teamMembers ?? []) {
        const existing = this.store.findUserByEmailOrDocument(member.email, member.cpf);
        const relation = member.profile === "advogado" ? "advogado" : member.profile === "gestor" ? "gestor" : member.profile === "colaborador" ? "colaborador" : "representante_legal";
        if (existing) {
          this.store.linkUserToOrganization({ organizationId: organization.id, userId: existing.id, relation });
          linkedTeamMembers += 1;
          if (member.profile === "advogado") linkedLawyers += 1;
          continue;
        }

        this.store.addPendingOrganizationMember({
          organizationId: organization.id,
          name: member.name,
          email: member.email,
          cpf: member.cpf,
          profile: member.profile,
          phone: member.phone,
          roleTitle: member.roleTitle,
          oab: member.oab,
          section: member.section,
        });
        pendingTeamMembers += 1;
        if (member.profile === "advogado") pendingLawyers += 1;
      }

      // Compatibilidade com payload antigo de advogados.
      for (const lawyer of input.organization.lawyers ?? []) {
        const existing = this.store.findUserByEmailOrDocument(lawyer.email, lawyer.cpf);
        if (existing) {
          this.store.linkUserToOrganization({ organizationId: organization.id, userId: existing.id, relation: "advogado" });
          linkedLawyers += 1;
          linkedTeamMembers += 1;
          continue;
        }
        this.store.addPendingOrganizationMember({
          organizationId: organization.id,
          name: lawyer.name,
          email: lawyer.email,
          cpf: lawyer.cpf,
          profile: "advogado",
          roleTitle: "advogado",
          oab: lawyer.oab,
          section: lawyer.section,
        });
        pendingLawyers += 1;
        pendingTeamMembers += 1;
      }
    }

    // Quando um advogado autônomo se cadastra, ele é vinculado automaticamente
    // aos escritórios em que já foi pré-cadastrado.
    const membershipsActivated = this.store.consumePendingOrganizationMembers({
      id: user.id,
      email: user.email,
      document: user.document,
    });

    const destination = input.verificationChannel === "whatsapp" ? (input.phone ?? "") : user.email;
    const token = this.store.createVerificationToken(user.id, input.verificationChannel, destination);
    const verificationUrl = `${process.env.FRONTEND_URL ?? "http://127.0.0.1:5173"}/?verify=${token}`;
    if (input.verificationChannel === "whatsapp") {
      console.log(`Confirmação via WhatsApp para ${destination}: ${verificationUrl}`);
    } else {
      console.log(`Confirmação de e-mail para ${user.email}: ${verificationUrl}`);
    }
    return {
      message: "Cadastro criado. Confirme seu cadastro para continuar.",
      verificationUrl,
      verificationChannel: input.verificationChannel,
      representative: {
        roleLabel: input.role === "despachante" ? "Representante legal (despachante) autônomo" : undefined,
        legalRepresentativeTrack: input.legalRepresentativeTrack,
        isClientSelfRepresentative,
        isRepresentativeAlsoClient,
      },
      memberships: {
        linkedLawyers,
        pendingLawyers,
        linkedTeamMembers,
        pendingTeamMembers,
        membershipsActivated,
      },
    };
  }

  lookupLawyer(filters: { email?: string; cpf?: string; oab?: string; name?: string }) {
    const normalizedCpf = filters.cpf?.replace(/\D/g, "");
    const normalizedOab = filters.oab?.replace(/\D/g, "");
    const user = this.store.findLawyer(filters.email, normalizedCpf, normalizedOab, filters.name);
    if (!user) return { found: false };
    return {
      found: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        oab: user.oab,
        section: user.section,
      },
    };
  }

  lookupMember(filters: { email?: string; cpf?: string; name?: string }) {
    const normalizedCpf = filters.cpf?.replace(/\D/g, "");
    const user = this.store.findMember(filters.email, normalizedCpf, filters.name);
    if (!user) return { found: false };
    return {
      found: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        document: user.document,
        oab: user.oab,
        section: user.section,
      },
    };
  }

  verifyEmail(token: string) {
    const user = this.store.consumeVerificationToken(token);
    if (!user) throw new BadRequestException("Este link é inválido, expirou ou já foi utilizado.");
    return { message: "E-mail confirmado com sucesso.", user: this.publicUser(user) };
  }

  async login(email: string, password: string) {
    const user = this.store.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException("E-mail ou senha inválidos.");
    if (!user.emailVerified) throw new UnauthorizedException("Confirme seu e-mail antes de entrar.");
    return this.session(user);
  }

  me(userId: string) {
    const user = this.store.findUserById(userId);
    if (!user) throw new UnauthorizedException();
    return {
      ...this.publicUser(user),
      organizations: this.store.findOrganizationsByUser(userId),
      addresses: this.store.listAddresses("user", userId),
      contacts: this.store.listContacts("user", userId),
    };
  }

  addRole(userId: string, role: Role) {
    const user = this.store.findUserById(userId);
    if (!user) throw new UnauthorizedException();
    if (role === "advogado" && !user.oab) {
      throw new BadRequestException("Para incluir o papel de advogado, informe OAB no cadastro.");
    }
    const updated = this.store.addRoleToUser(userId, role);
    if (!updated) throw new UnauthorizedException();
    return {
      message: "Papel adicionado com sucesso.",
      user: this.publicUser(updated),
    };
  }

  session(user: { id: string; email: string; role: Role; roles?: Role[]; name: string; emailVerified: boolean }) {
    return {
      accessToken: this.jwt.sign({ sub: user.id, email: user.email, role: user.role }),
      user: this.publicUser(user),
    };
  }

  publicUser(user: { id: string; name: string; email: string; role: Role; roles?: Role[]; emailVerified: boolean }) {
    return { id: user.id, name: user.name, email: user.email, role: user.role, roles: user.roles ?? [user.role], emailVerified: user.emailVerified };
  }
}