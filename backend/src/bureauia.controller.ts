import { Body, Controller, Get, Post } from "@nestjs/common";
import { IsArray, IsBoolean, IsIn, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BureauIAService, ProcessType } from "./bureauia.service";

class AnalyzeDto {
  @IsString() docId!: string;
}

class ChecklistDto {
  @IsIn(["Trabalhista", "Inventario", "Usucapiao", "Licitacao", "Imovel", "Empresa", "Consumidor", "Familia"])
  processo!: ProcessType;
}

class AlertsDto {
  @IsString() docId!: string;
}

class ChatDto {
  @IsString() prompt!: string;
}

class ChecklistSuggestionDto {
  @IsIn(["Trabalhista", "Inventario", "Usucapiao", "Licitacao", "Imovel", "Empresa", "Consumidor", "Familia"])
  processo!: ProcessType;

  @IsArray()
  @IsString({ each: true })
  faltantes!: string[];
}

class InsightsDto {
  @IsArray()
  @IsString({ each: true })
  alerts!: Array<"CPF invalido" | "Documento ilegivel" | "Imagem cortada" | "Baixa resolucao" | "Duplicado">;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistSuggestionDto)
  checklistSuggestions!: ChecklistSuggestionDto[];

  @IsBoolean()
  hasOcr!: boolean;
}

@Controller("bureau-ia")
export class BureauIAController {
  constructor(private readonly bureauIA: BureauIAService) {}

  @Get("docs")
  docs() {
    return this.bureauIA.listDocs();
  }

  @Post("analyze")
  analyze(@Body() body: AnalyzeDto) {
    return this.bureauIA.analyzeDocument(body.docId);
  }

  @Post("checklist")
  checklist(@Body() body: ChecklistDto) {
    return this.bureauIA.checklist(body.processo);
  }

  @Post("alerts")
  alerts(@Body() body: AlertsDto) {
    return this.bureauIA.alerts(body.docId);
  }

  @Post("chat")
  chat(@Body() body: ChatDto) {
    return this.bureauIA.chat(body.prompt);
  }

  @Post("insights")
  insights(@Body() body: InsightsDto) {
    return this.bureauIA.insights(body);
  }
}
