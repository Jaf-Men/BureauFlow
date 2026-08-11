import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { IsEmail, IsISO8601, IsOptional, IsString, MinLength } from "class-validator";
import { AuthenticatedRequest, JwtAuthGuard } from "./jwt-auth.guard";
import { InvitationService } from "./invitation.service";

class CreateInvitationDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() message?: string;
  @IsISO8601() expiresAt!: string;
}

class AcceptInvitationDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @MinLength(10) password!: string;
}

@Controller("invitations")
export class InvitationController {
  constructor(private readonly invitations: InvitationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: CreateInvitationDto) {
    return this.invitations.create(request.user.id, body);
  }

  @Get(":token")
  preview(@Param("token") token: string) {
    return this.invitations.preview(token);
  }

  @Post(":token/accept")
  accept(@Param("token") token: string, @Body() body: AcceptInvitationDto) {
    return this.invitations.accept(token, body);
  }
}