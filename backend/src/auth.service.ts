import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { Role, StoreService } from "./store.service";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  document?: string;
  oab?: string;
  section?: string;
  organization?: {
    name: string;
    document: string;
    address?: string;
    phone?: string;
    responsibleName: string;
    responsibleEmail: string;
    lawyers: Array<{ name: string; email: string; oab: string; section: string }>;
  };
}

@Injectable()
export class AuthService {
  constructor(private readonly store: StoreService, private readonly jwt: JwtService) {}

  async register(input: RegisterInput) {
    if (this.store.findUserByEmail(input.email)) throw new BadRequestException("Este e-mail já está cadastrado.");
    if (input.role === "escritorio" && !input.organization) throw new BadRequestException("Informe os dados do escritório.");

    const user = this.store.createUser({
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: input.role,
      phone: input.phone,
      document: input.document,
      oab: input.oab,
      section: input.section,
      emailVerified: false,
    });

    if (input.organization) this.store.createOrganization({ ...input.organization, ownerId: user.id });
    const token = this.store.createVerificationToken(user.id);
    const verificationUrl = `${process.env.FRONTEND_URL ?? "http://127.0.0.1:5173"}/?verify=${token}`;
    console.log(`Confirmação de e-mail para ${user.email}: ${verificationUrl}`);
    return { message: "Cadastro criado. Confirme seu e-mail para continuar.", verificationUrl };
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
    return this.publicUser(user);
  }

  session(user: { id: string; email: string; role: Role; name: string; emailVerified: boolean }) {
    return {
      accessToken: this.jwt.sign({ sub: user.id, email: user.email, role: user.role }),
      user: this.publicUser(user),
    };
  }

  publicUser(user: { id: string; name: string; email: string; role: Role; emailVerified: boolean }) {
    return { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified };
  }
}