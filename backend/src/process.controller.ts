import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { IsIn, IsOptional, IsString } from "class-validator";
import { AuthenticatedRequest, JwtAuthGuard } from "./jwt-auth.guard";
import { ProcessService } from "./process.service";

class CreateProcessDto {
  @IsString() name!: string;
  @IsOptional() @IsString() organizationId?: string;
}

class AddParticipantDto {
  @IsString() userId!: string;
  @IsIn(["CLIENT", "LAWYER", "LEGAL_REPRESENTATIVE", "PARTY", "WITNESS", "RESPONSIBLE", "OTHER"])
  role!: "CLIENT" | "LAWYER" | "LEGAL_REPRESENTATIVE" | "PARTY" | "WITNESS" | "RESPONSIBLE" | "OTHER";
  @IsOptional() @IsString() organizationId?: string;
}

class ReplaceLegalRepresentativeDto {
  @IsString() representativeUserId!: string;
  @IsOptional() @IsString() organizationId?: string;
  @IsOptional() @IsString() replacementReason?: string;
}

@Controller("processes")
@UseGuards(JwtAuthGuard)
export class ProcessController {
  constructor(private readonly processes: ProcessService) {}

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: CreateProcessDto) {
    return this.processes.create(request.user.id, body);
  }

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.processes.list(request.user.id);
  }

  @Get(":processId")
  detail(@Req() request: AuthenticatedRequest, @Param("processId") processId: string) {
    return this.processes.detail(request.user.id, processId);
  }

  @Post(":processId/participants")
  addParticipant(@Req() request: AuthenticatedRequest, @Param("processId") processId: string, @Body() body: AddParticipantDto) {
    return this.processes.addParticipant(request.user.id, processId, body);
  }

  @Post(":processId/legal-representative")
  replaceLegalRepresentative(@Req() request: AuthenticatedRequest, @Param("processId") processId: string, @Body() body: ReplaceLegalRepresentativeDto) {
    return this.processes.replaceLegalRepresentative(request.user.id, processId, body);
  }
}
