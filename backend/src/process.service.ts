import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ProcessParticipantRole, StoreService } from "./store.service";

@Injectable()
export class ProcessService {
  constructor(private readonly store: StoreService) {}

  private assertAccess(userId: string, processId: string) {
    const process = this.store.findProcessById(processId);
    if (!process) throw new NotFoundException("Processo não encontrado.");
    const canAccess = process.createdByUserId === userId || (process.organizationId ? this.store.userBelongsToOrganization(userId, process.organizationId) : false);
    if (!canAccess) throw new ForbiddenException("Sem autorização para acessar este processo.");
    return process;
  }

  create(userId: string, input: { name: string; organizationId?: string }) {
    if (!input.name.trim()) throw new BadRequestException("Nome do processo é obrigatório.");
    if (input.organizationId && !this.store.findOrganizationById(input.organizationId)) {
      throw new BadRequestException("Organização informada não existe.");
    }
    if (input.organizationId && !this.store.userBelongsToOrganization(userId, input.organizationId)) {
      throw new ForbiddenException("Sem autorização para criar processo nesta organização.");
    }
    const process = this.store.createProcess({
      name: input.name.trim(),
      organizationId: input.organizationId,
      createdByUserId: userId,
      status: "active",
    });
    return { process };
  }

  list(userId: string) {
    return { processes: this.store.listProcessesByUser(userId) };
  }

  detail(userId: string, processId: string) {
    const process = this.assertAccess(userId, processId);
    const participants = this.store.listProcessParticipants(processId, false);
    return { process, participants };
  }

  addParticipant(userId: string, processId: string, input: { userId: string; role: ProcessParticipantRole; organizationId?: string }) {
    const process = this.assertAccess(userId, processId);
    const participantUser = this.store.findUserById(input.userId);
    if (!participantUser) throw new BadRequestException("Participante não encontrado.");

    if (input.role === "LAWYER" && !this.store.userHasRole(input.userId, "advogado")) {
      throw new BadRequestException("Participante deve possuir papel de advogado.");
    }

    if (input.role === "LEGAL_REPRESENTATIVE") {
      if (!this.store.userHasRole(input.userId, "despachante")) {
        throw new BadRequestException("Participante deve possuir papel Representante legal (despachante).");
      }
      if (this.store.findActiveLegalRepresentative(processId)) {
        throw new BadRequestException("Processo já possui um Representante legal ativo. Use substituição para trocar.");
      }
      const entry = this.store.upsertActiveLegalRepresentative({
        processId,
        representativeUserId: input.userId,
        organizationId: input.organizationId ?? process.organizationId,
        replacementReason: "Definição inicial de representante legal",
      });
      return {
        message: "Representante legal associado com sucesso.",
        participant: entry.next,
      };
    }

    const participant = this.store.addProcessParticipant({
      processId,
      userId: input.userId,
      organizationId: input.organizationId ?? process.organizationId,
      role: input.role,
    });
    return { message: "Participante adicionado com sucesso.", participant };
  }

  replaceLegalRepresentative(
    userId: string,
    processId: string,
    input: { representativeUserId: string; organizationId?: string; replacementReason?: string },
  ) {
    const process = this.assertAccess(userId, processId);
    const representative = this.store.findUserById(input.representativeUserId);
    if (!representative) throw new BadRequestException("Representante não encontrado.");
    if (!this.store.userHasRole(representative.id, "despachante")) {
      throw new BadRequestException("A pessoa selecionada não possui papel de Representante legal (despachante).");
    }

    const result = this.store.upsertActiveLegalRepresentative({
      processId,
      representativeUserId: input.representativeUserId,
      organizationId: input.organizationId ?? process.organizationId,
      replacementReason: input.replacementReason ?? "Substituição de representante legal",
    });

    return {
      message: result.previous ? "Representante legal substituído com histórico preservado." : "Representante legal definido com sucesso.",
      previous: result.previous,
      current: result.next,
    };
  }
}
