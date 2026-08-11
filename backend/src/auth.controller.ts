import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { IsArray, IsEmail, IsIn, IsOptional, IsString, Matches, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AuthService } from "./auth.service";
import { AuthenticatedRequest, JwtAuthGuard } from "./jwt-auth.guard";

class LawyerDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() oab!: string;
  @IsString() section!: string;
}

class OrganizationDto {
  @IsString() name!: string;
  @Matches(/^\d{14}$/) document!: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() responsibleName!: string;
  @IsEmail() responsibleEmail!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => LawyerDto) lawyers!: LawyerDto[];
}

class RegisterDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @MinLength(10) password!: string;
  @IsIn(["advogado", "escritorio", "cliente"]) role!: "advogado" | "escritorio" | "cliente";
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() document?: string;
  @IsOptional() @IsString() oab?: string;
  @IsOptional() @IsString() section?: string;
  @IsOptional() @ValidateNested() @Type(() => OrganizationDto) organization?: OrganizationDto;
}

class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
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
}