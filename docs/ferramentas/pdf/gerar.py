"""Gera os PDFs do PRD e da arquitetura a partir dos .md deste repositório.

Uso, a partir da raiz do repositório:
    python docs/ferramentas/pdf/gerar.py            # PRD e arquitetura
    python docs/ferramentas/pdf/gerar.py prd        # só o PRD
    python docs/ferramentas/pdf/gerar.py arquitetura

Visual: o dos PDFs enviados à Cleo desde o plano de ação (A4, Segoe UI 9,2 pt, azul-marinho #182F4F, dourado #BD903F,
logo no alto à esquerda, versão e contrato à direita, números das seções em dourado e rodapé com o nome e a página),
com o logo novo da ELO (public/marca/logo-elo.svg).

Como funciona: um conversor próprio de Markdown (o projeto não depende do pacote markdown) monta o HTML, o Edge sem
interface imprime o PDF e o PyMuPDF grava os metadados. Duas passadas: a primeira acha a página de cada seção, a segunda
escreve essas páginas no sumário. Os diagramas Mermaid são desenhados pelo mermaid.js, baixado uma vez para
mermaid.min.js, ao lado deste arquivo (fora do Git); o diagrama de entidades vai numa página deitada.

Saída: a pasta docs/ do projeto, ao lado do repositório (C:\\Projetos\\elohub\\docs), onde ficam os PDFs enviados à Cleo;
sem ela, docs/pdf/ dentro do repositório. Requer Windows com o Edge e o PyMuPDF (pip install pymupdf).
"""

import html
import os
import re
import subprocess
import sys
import tempfile
import urllib.request

import fitz  # PyMuPDF

AQUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(AQUI, '..', '..', '..'))
FONTES_MD = {'prd': os.path.join(REPO, 'docs', 'prd.md'), 'arquitetura': os.path.join(REPO, 'docs', 'arquitetura.md')}
NOMES = {'prd': 'PRD', 'arquitetura': 'Arquitetura'}
LOGO = os.path.join(REPO, 'public', 'marca', 'logo-elo.svg')
EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
MERMAID_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js'
MERMAID = os.path.join(AQUI, 'mermaid.min.js')
CONTRATO = 'Contrato Sebraetec SB.2038.26'

url = lambda caminho: 'file:///' + caminho.replace('\\', '/')


def pasta_de_saida() -> str:
    fora = os.path.abspath(os.path.join(REPO, '..', 'docs'))
    if os.path.isdir(fora):
        return fora
    dentro = os.path.join(REPO, 'docs', 'pdf')
    os.makedirs(dentro, exist_ok=True)
    return dentro


# ---------------------------------------------------------------------------------------------------------------------
# Markdown para HTML: só o que o PRD e a arquitetura usam (títulos, parágrafos, tabelas, listas com até dois níveis,
# citações, blocos de código e Mermaid, negrito, itálico, código e links).
# ---------------------------------------------------------------------------------------------------------------------

def inline(texto: str) -> str:
    codigos = []

    def guarda(m):
        codigos.append(m.group(1))
        return f'\x00{len(codigos) - 1}\x00'

    texto = re.sub(r'`([^`]+)`', guarda, texto)
    texto = html.escape(texto, quote=False)
    texto = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', lambda m: f'<a href="{html.escape(m.group(2))}">{m.group(1)}</a>', texto)
    texto = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', texto)
    texto = re.sub(r'(?<![*\w])\*(?![*\s])(.+?)(?<![*\s])\*(?![*\w])', r'<i>\1</i>', texto)
    return re.sub(r'\x00(\d+)\x00', lambda m: f'<code>{html.escape(codigos[int(m.group(1))], quote=False)}</code>', texto)


def celulas(linha: str) -> list:
    """Divide uma linha de tabela pelos | que não estão dentro de código."""
    linha = linha.strip()
    if linha.startswith('|'):
        linha = linha[1:]
    if linha.endswith('|') and not linha.endswith('\\|'):
        linha = linha[:-1]
    partes, atual, em_codigo, i = [], '', False, 0
    while i < len(linha):
        c = linha[i]
        if c == '\\' and i + 1 < len(linha) and linha[i + 1] == '|':
            atual += '|'
            i += 2
            continue
        if c == '`':
            em_codigo = not em_codigo
        if c == '|' and not em_codigo:
            partes.append(atual.strip())
            atual = ''
        else:
            atual += c
        i += 1
    partes.append(atual.strip())
    return partes


def tabela(linhas: list) -> str:
    cabecalho = celulas(linhas[0])
    corpo = [celulas(l) for l in linhas[2:]]
    th = ''.join(f'<th>{inline(c)}</th>' for c in cabecalho)
    trs = ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in linha) + '</tr>' for linha in corpo)
    return f'<table><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table>'


ITEM = re.compile(r'^(\s*)([-*]|\d+\.)\s+(.*)$')


def lista(linhas: list) -> str:
    """Listas com aninhamento por recuo. Linhas de continuação entram no item anterior."""
    itens = []  # [recuo, marcador, texto em HTML]
    for linha in linhas:
        m = ITEM.match(linha)
        if m:
            itens.append([len(m.group(1)), m.group(2), inline(m.group(3))])
        else:
            itens[-1][2] += ' ' + inline(linha.strip())

    def desenhar(i: int, recuo: int):
        marcador = itens[i][1]
        tag = 'ol' if marcador[0].isdigit() else 'ul'
        inicio = f' start="{marcador[:-1]}"' if tag == 'ol' and marcador != '1.' else ''
        saida = [f'<{tag}{inicio}>']
        while i < len(itens) and itens[i][0] == recuo:
            conteudo = itens[i][2]
            i += 1
            if i < len(itens) and itens[i][0] > recuo:
                sublista, i = desenhar(i, itens[i][0])
                conteudo += sublista
            saida.append(f'<li>{conteudo}</li>')
        saida.append(f'</{tag}>')
        return ''.join(saida), i

    resultado, i = desenhar(0, itens[0][0])
    while i < len(itens):
        mais, i = desenhar(i, itens[i][0])
        resultado += mais
    return resultado


def titulo_h2(texto: str, chave: str) -> str:
    marcador = f'<span class="marcador">§{chave}§</span>'
    m = re.match(r'^(\d+)\.\s+(.*)$', texto)
    if m:
        return f'<h2 id="{chave}">{marcador}<small>{m.group(1)}</small>{inline(m.group(2))}</h2>'
    return f'<h2 id="{chave}">{marcador}{inline(texto)}</h2>'


def converter(md: str):
    """Devolve (título, subtítulo, tabela de campos, corpo em HTML, lista de seções para o sumário)."""
    linhas = md.replace('\r\n', '\n').split('\n')
    titulo, subtitulo, campos = '', '', []
    blocos, secoes = [], []
    i = 0
    while i < len(linhas):
        linha = linhas[i]
        if not linha.strip() or re.fullmatch(r'-{3,}', linha.strip()):
            i += 1
            continue
        if linha.startswith('```'):
            linguagem = linha[3:].strip()
            fim = i + 1
            while not linhas[fim].startswith('```'):
                fim += 1
            codigo = '\n'.join(linhas[i + 1:fim])
            if linguagem == 'mermaid':
                deitado = codigo.lstrip().startswith('erDiagram')
                diagrama = f'<div class="diagrama"><pre class="mermaid">{html.escape(codigo, quote=False)}</pre></div>'
                if deitado:
                    # O título que vem logo antes acompanha o diagrama na página deitada.
                    anterior = blocos.pop() if blocos and blocos[-1].startswith('<h3') else ''
                    blocos.append(f'<section class="paisagem">{anterior}{diagrama}</section>')
                else:
                    blocos.append(diagrama)
            else:
                blocos.append(f'<pre class="codigo">{html.escape(codigo, quote=False)}</pre>')
            i = fim + 1
            continue
        m = re.match(r'^(#{1,4})\s+(.*)$', linha)
        if m:
            nivel, texto = len(m.group(1)), m.group(2).strip()
            if nivel == 1:
                titulo, _, subtitulo = (p.strip() for p in texto.partition('|'))
            elif nivel == 2:
                chave = f's{len(secoes) + 1}'
                secoes.append((chave, texto))
                blocos.append(titulo_h2(texto, chave))
            else:
                blocos.append(f'<h{nivel}>{inline(texto)}</h{nivel}>')
            i += 1
            continue
        if linha.startswith('|'):
            fim = i
            while fim < len(linhas) and linhas[fim].startswith('|'):
                fim += 1
            if not secoes and not campos and titulo:
                campos = [celulas(l) for l in linhas[i + 2:fim]]
            blocos.append(tabela(linhas[i:fim]))
            i = fim
            continue
        if linha.startswith('>'):
            fim = i
            while fim < len(linhas) and linhas[fim].startswith('>'):
                fim += 1
            paragrafos = '\n'.join(l[1:].strip() for l in linhas[i:fim]).split('\n\n')
            blocos.append('<blockquote>' + ''.join(f'<p>{inline(" ".join(p.split()))}</p>' for p in paragrafos) + '</blockquote>')
            i = fim
            continue
        if ITEM.match(linha):
            fim = i + 1
            while fim < len(linhas) and linhas[fim].strip() and (ITEM.match(linhas[fim]) or linhas[fim].startswith('  ')):
                fim += 1
            blocos.append(lista(linhas[i:fim]))
            i = fim
            continue
        fim = i
        while (fim < len(linhas) and linhas[fim].strip() and not re.match(r'^(#{1,4}\s|\||>|```)', linhas[fim])
               and not ITEM.match(linhas[fim])):
            fim += 1
        blocos.append(f'<p>{inline(" ".join(l.strip() for l in linhas[i:fim]))}</p>')
        i = fim
    # A tabela de campos, logo depois do título, vai para a capa, e não para o corpo.
    if campos and blocos and blocos[0].startswith('<table>'):
        blocos = blocos[1:]
    return titulo, subtitulo, campos, '\n'.join(blocos), secoes


# ---------------------------------------------------------------------------------------------------------------------
# Página
# ---------------------------------------------------------------------------------------------------------------------

def campo(campos: list, nome: str) -> str:
    for linha in campos:
        if linha and linha[0] == nome:
            return linha[1]
    return ''


def montar_html(doc: str, md: str, paginas: dict) -> tuple:
    titulo, subtitulo, campos, corpo, secoes = converter(md)
    versao = re.match(r'[\d.]+', campo(campos, 'Versão')).group(0).rstrip('.')
    data = campo(campos, 'Data')
    aprovacao = campo(campos, 'Aprovação').split('(')[0].strip()
    rodape = f'{NOMES[doc]} v{versao} · Plataforma ELO'
    linhas_campos = ''.join(f'<tr><td>{inline(c[0])}</td><td>{inline(c[1])}</td></tr>' for c in campos if len(c) > 1)
    sumario = ''.join(
        f'<a class="item" href="#{chave}"><span>{inline(texto)}</span><span>{paginas.get(chave, "")}</span></a>'
        for chave, texto in secoes
    )
    diagramas = 'class="mermaid"' in corpo
    script = ''
    if diagramas:
        script = f"""<script src="{url(MERMAID)}"></script>
<script>
  mermaid.initialize({{ startOnLoad: false, securityLevel: 'loose', theme: 'base', fontFamily: 'Segoe UI, sans-serif',
    themeVariables: {{ primaryColor: '#F1F4F8', primaryBorderColor: '#182F4F', primaryTextColor: '#182F4F',
      lineColor: '#6B7684', clusterBkg: '#FBF7EF', clusterBorder: '#BD903F', fontSize: '13px' }},
    flowchart: {{ htmlLabels: true, useMaxWidth: true }}, er: {{ useMaxWidth: true }} }});
  mermaid.run({{ querySelector: '.mermaid' }}).then(() => document.body.setAttribute('data-pronto', '1'));
</script>"""
    pagina = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>{html.escape(rodape)}</title>
<style>
  :root {{ --marinho: #182F4F; --dourado: #BD903F; --texto: #243142; --apoio: #6B7684; --linha: #E3E6EB; --fundo: #F6F7F9; }}
  @page {{
    size: A4; margin: 18mm 17mm 18mm 17mm;
    @bottom-left {{ content: "{rodape}"; font: 7.5pt 'Segoe UI', sans-serif; color: #8A94A3; }}
    @bottom-right {{ content: counter(page) " / " counter(pages); font: 7.5pt 'Segoe UI', sans-serif; color: #8A94A3; }}
  }}
  @page paisagem {{ size: A4 landscape; margin: 14mm 15mm 16mm 15mm; }}
  * {{ box-sizing: border-box; }}
  html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
  body {{ margin: 0; font: 9.2pt/1.5 'Segoe UI', sans-serif; color: var(--texto); }}
  a {{ color: inherit; text-decoration: none; }}
  p a, td a, li a {{ color: var(--marinho); text-decoration: underline; text-decoration-color: var(--dourado); }}
  .marcador {{ font-size: 1px; color: #fff; position: absolute; left: 0; top: 0; }}
  .topo {{ display: flex; justify-content: space-between; align-items: flex-start; }}
  .topo img {{ height: 86px; display: block; }}
  .topo .versao {{ text-align: right; font-size: 8pt; color: var(--apoio); line-height: 1.6; }}
  h1 {{ font: 600 24pt/1.15 'Segoe UI Semibold', 'Segoe UI', sans-serif; color: var(--marinho); margin: 34px 0 4px; }}
  .sub {{ font-size: 11pt; color: var(--apoio); margin: 0; }}
  .regua {{ width: 30mm; height: 3px; background: var(--dourado); margin: 18px 0 26px; border-radius: 2px; }}
  .meta {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; border-top: 1px solid var(--linha); border-bottom: 1px solid var(--linha); padding: 10px 0; margin: 0 0 14px; }}
  .meta dt {{ font-size: 7.3pt; letter-spacing: .12em; text-transform: uppercase; color: var(--apoio); }}
  .meta dd {{ margin: 3px 0 0; font: 600 9.4pt 'Segoe UI Semibold', 'Segoe UI', sans-serif; color: var(--marinho); }}
  h3.sumario {{ font: 600 10.5pt 'Segoe UI Semibold', 'Segoe UI', sans-serif; color: var(--marinho); margin: 22px 0 8px; }}
  .itens {{ columns: 2; column-gap: 28px; }}
  .itens .item {{ display: flex; justify-content: space-between; gap: 10px; padding: 4px 0; border-bottom: 1px solid var(--linha); break-inside: avoid; font-size: 8.6pt; }}
  .itens .item span:last-child {{ color: var(--apoio); }}
  .corpo {{ margin-top: 0; }}
  h2 {{ font: 600 15pt/1.25 'Segoe UI Semibold', 'Segoe UI', sans-serif; color: var(--marinho); margin: 26px 0 10px; break-after: avoid; position: relative; }}
  h2 small {{ color: var(--dourado); font-size: 15pt; margin-right: 12px; }}
  .corpo > h2:first-child {{ break-before: page; margin-top: 0; }}
  h3 {{ font: 600 11.5pt/1.3 'Segoe UI Semibold', 'Segoe UI', sans-serif; color: var(--marinho); margin: 18px 0 6px; break-after: avoid; }}
  h4 {{ font: 600 9.8pt/1.3 'Segoe UI Semibold', 'Segoe UI', sans-serif; color: var(--marinho); margin: 14px 0 4px; break-after: avoid; }}
  p {{ margin: 0 0 8px; }}
  b {{ font-weight: 600; color: #1B2A3C; }}
  code {{ font: 8.3pt Consolas, 'Cascadia Mono', monospace; background: var(--fundo); padding: 0 3px; border-radius: 3px; }}
  pre.codigo {{ font: 8pt/1.45 Consolas, monospace; background: var(--fundo); padding: 10px 12px; border-radius: 6px; white-space: pre-wrap; }}
  ul, ol {{ margin: 0 0 8px; padding-left: 18px; }}
  li {{ margin: 0 0 3px; }}
  li > ul, li > ol {{ margin: 3px 0 0; }}
  blockquote {{ margin: 0 0 10px; padding: 8px 14px; background: var(--fundo); border-left: 3px solid var(--marinho); border-radius: 0 6px 6px 0; }}
  blockquote p:last-child {{ margin: 0; }}
  table {{ width: 100%; border-collapse: collapse; margin: 4px 0 12px; font-size: 8.4pt; line-height: 1.45; }}
  thead {{ display: table-header-group; }}
  th {{ text-align: left; font-weight: 400; font-size: 7pt; letter-spacing: .12em; text-transform: uppercase; color: var(--apoio); padding: 6px 8px 6px 0; border-bottom: 1.5px solid var(--marinho); vertical-align: bottom; }}
  td {{ padding: 6px 8px 6px 0; border-bottom: 1px solid var(--linha); vertical-align: top; }}
  tr {{ break-inside: avoid; }}
  table.campos td:first-child {{ width: 34%; }}
  td code {{ overflow-wrap: anywhere; }}
  .diagrama {{ margin: 6px 0 14px; text-align: center; break-inside: avoid; }}
  .diagrama svg {{ max-width: 100%; height: auto; }}
  section.paisagem {{ page: paisagem; break-before: page; break-after: page; }}
  section.paisagem h3 {{ margin-top: 0; }}
  section.paisagem .diagrama svg {{ max-height: 165mm; width: 100%; }}
</style>
</head>
<body>
<header class="topo">
  <img src="{url(LOGO)}" alt="ELO Hub">
  <div class="versao">Versão {versao} · {html.escape(data)}<br>{CONTRATO}</div>
</header>
<h1>{inline(titulo)}</h1>
<p class="sub">{inline(subtitulo)}</p>
<div class="regua"></div>
<dl class="meta">
  <div><dt>Versão</dt><dd>{versao}</dd></div>
  <div><dt>Data</dt><dd>{html.escape(data)}</dd></div>
  <div><dt>Aprovação</dt><dd>{html.escape(aprovacao)}</dd></div>
</dl>
<table class="campos"><thead><tr><th>Campo</th><th>Valor</th></tr></thead><tbody>{linhas_campos}</tbody></table>
<h3 class="sumario">Sumário</h3>
<nav class="itens">{sumario}</nav>
<main class="corpo">
{corpo}
</main>
{script}
</body>
</html>"""
    return pagina, versao, data, secoes, rodape


def garantir_mermaid() -> None:
    if not os.path.exists(MERMAID):
        urllib.request.urlretrieve(MERMAID_URL, MERMAID)


def imprimir(html_texto: str, destino: str, pasta: str) -> None:
    html_saida = os.path.join(pasta, 'documento.html')
    with open(html_saida, 'w', encoding='utf-8') as f:
        f.write(html_texto)
    perfil = tempfile.mkdtemp(prefix='edge-pdf-')
    subprocess.run([
        EDGE, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--allow-file-access-from-files',
        '--virtual-time-budget=30000', '--run-all-compositor-stages-before-draw',
        f'--user-data-dir={perfil}', f'--print-to-pdf={destino}', url(html_saida),
    ], check=True, capture_output=True, timeout=240)


def paginas_das_secoes(caminho_pdf: str, chaves: list) -> dict:
    doc = fitz.open(caminho_pdf)
    achadas = {}
    for i, pagina in enumerate(doc):
        texto = pagina.get_text()
        for chave in chaves:
            if chave not in achadas and f'§{chave}§' in texto:
                achadas[chave] = i + 1
    doc.close()
    return achadas


def gerar(doc: str) -> str:
    with open(FONTES_MD[doc], encoding='utf-8') as f:
        md = f.read()
    if '```mermaid' in md:
        garantir_mermaid()
    pasta = tempfile.mkdtemp(prefix=f'pdf-{doc}-')
    temporario = os.path.join(pasta, 'documento.pdf')
    pagina, versao, data, secoes, rodape = montar_html(doc, md, {})
    imprimir(pagina, temporario, pasta)
    paginas = paginas_das_secoes(temporario, [chave for chave, _ in secoes])
    faltam = [texto for chave, texto in secoes if chave not in paginas]
    if faltam:
        raise SystemExit(f'Seções sem página encontrada: {faltam}')
    pagina, *_ = montar_html(doc, md, paginas)
    imprimir(pagina, temporario, pasta)
    destino = os.path.join(pasta_de_saida(), f'{NOMES[doc]} - Plataforma ELO v{versao}.pdf')
    pdf = fitz.open(temporario)
    pdf.set_metadata({
        'title': rodape,
        'author': 'Result Consultoria e Inovação',
        'creator': 'Result Consultoria e Inovação',
        'producer': 'Result Consultoria e Inovação',
        'subject': f'{NOMES[doc]} da Plataforma ELO, versão {versao}, {data}',
    })
    pdf.save(destino, garbage=3, deflate=True)
    print(f'{destino}  {pdf.page_count} páginas  {os.path.getsize(destino) // 1024} KB')
    pdf.close()
    return destino


if __name__ == '__main__':
    pedidos = sys.argv[1:] or ['prd', 'arquitetura']
    for pedido in pedidos:
        if pedido not in FONTES_MD:
            raise SystemExit(f'Documento desconhecido: {pedido}. Use prd ou arquitetura.')
        gerar(pedido)
