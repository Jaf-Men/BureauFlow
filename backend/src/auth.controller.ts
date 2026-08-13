import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { IsArray, IsEmail, IsIn, IsOptional, IsString, Matches, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AuthService } from "./auth.service";
import { AuthenticatedRequest, JwtAuthGuard } from "./jwt-auth.guard";

class AddressDto {
  @IsOptional() @IsString() zipCode?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() number?: string;
  @IsOptional() @IsString() complement?: string;
  @IsOptional() @IsString() reference?: string;
}

class LawyerDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() cpf?: string;
  @IsString() oab!: string;
  @IsString() section!: string;
}

class TeamMemberDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() cpf?: string;
  @IsIn(["advogado", "colaborador", "gestor", "representante_legal"]) profile!: "advogado" | "colaborador" | "gestor" | "representante_legal";
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() roleTitle?: string;
  @IsOptional() @IsString() oab?: string;
  @IsOptional() @IsString() section?: string;
}

class OrganizationDto {
  @IsString() name!: string;
  @Matches(/^\d{14}$/) document!: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @ValidateNested() @Type(() => AddressDto) workAddress?: AddressDto;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() responsibleName?: string;
  @IsOptional() @Matches(/^\d{11}$/) responsibleCpf?: string;
  @IsOptional() @IsString() responsibleRole?: string;
  @IsOptional() @IsEmail() responsibleEmail?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => LawyerDto) lawyers?: LawyerDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => TeamMemberDto) teamMembers?: TeamMemberDto[];
}

class RegisterDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @MinLength(10) password!: string;
  @IsIn(["advogado", "escritorio", "despachante", "empresa", "cliente"]) role!: "advogado" | "escritorio" | "despachante" | "empresa" | "cliente";
  @IsIn(["email", "whatsapp"]) verificationChannel!: "email" | "whatsapp";
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() document?: string;
  @IsOptional() @IsString() oab?: string;
  @IsOptional() @IsString() section?: string;
  @IsOptional() @ValidateNested() @Type(() => AddressDto) personalAddress?: AddressDto;
  @IsOptional() @ValidateNested() @Type(() => AddressDto) workAddress?: AddressDto;
  @IsOptional() @IsIn(["cliente", "despachante"]) legalRepresentativeTrack?: "cliente" | "despachante";
  @IsOptional() @ValidateNested() @Type(() => OrganizationDto) organization?: OrganizationDto;
}

class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}

class AddRoleDto {
  @IsIn(["advogado", "escritorio", "despachante", "empresa", "cliente"]) role!: "advogado" | "escritorio" | "despachante" | "empresa" | "cliente";
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @Get("lawyers/lookup")
  lookupLawyer(@Query("email") email?: string, @Query("cpf") cpf?: string, @Query("oab") oab?: string, @Query("name") name?: string) {
    return this.auth.lookupLawyer({ email, cpf, oab, name });
  }

  @Get("members/lookup")
  lookupMember(@Query("email") email?: string, @Query("cpf") cpf?: string, @Query("name") name?: string) {
    return this.auth.lookupMember({ email, cpf, name });
  }

  @Get("verify-email")
  verifyEmail(@Query("token") token: string) {
    return this.auth.verifyEmail(token);
  }

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() request: AuthenticatedRequest) {
    return this.auth.me(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("roles")
  addRole(@Req() request: AuthenticatedRequest, @Body() body: AddRoleDto) {
    return this.auth.addRole(request.user.id, body.role);
  }
}