# Guia de Exportacao PDF

## Opcao A - VS Code (mais simples)
1. Abra o arquivo markdown desejado.
2. Use Command Palette.
3. Execute: Markdown: Open Preview to the Side.
4. Execute: Markdown: Print.
5. Salve em PDF.

Arquivos recomendados para gerar em PDF:
1. 10-Relatorio-Executivo-PDF.md
2. 11-Anexo-Diagramas-PDF.md

## Opcao B - Extensao Markdown PDF
1. Instale a extensao Markdown PDF (yzane.markdown-pdf).
2. Clique com botao direito no arquivo markdown.
3. Selecione: Markdown PDF: Export (pdf).

## Opcao C - Pandoc (linha de comando)
Com pandoc instalado:

```bash
pandoc docs/Sprint-06.1-Pacote-Requisitos/10-Relatorio-Executivo-PDF.md -o docs/Sprint-06.1-Pacote-Requisitos/10-Relatorio-Executivo-PDF.pdf
pandoc docs/Sprint-06.1-Pacote-Requisitos/11-Anexo-Diagramas-PDF.md -o docs/Sprint-06.1-Pacote-Requisitos/11-Anexo-Diagramas-PDF.pdf
```

## Observacao sobre Mermaid
Dependendo da ferramenta de exportacao, diagramas Mermaid podem exigir renderizacao no preview antes de imprimir.
