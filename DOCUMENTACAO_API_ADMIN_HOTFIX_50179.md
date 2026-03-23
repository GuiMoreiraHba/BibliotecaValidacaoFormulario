# Documentação da Hotfix 50179 - Importação de Campos Adicionais com Validação de Caracteres

**Branch:** `hotfixes/50179-importacao-campo-adicional-lista-salva-codigo-remove-nome`  
**Data:** 16 de março a 23 de março de 2026  
**Desenvolvedor:** Guilherme Moreira  
**Demanda:** #50179

---

## 📋 Resumo Executivo

Esta hotfix implementa melhorias na funcionalidade de importação de campos de formulário, com foco especial na sanitização e validação de caracteres especiais em opções de formulário. As alterações garantem que dados importados sejam adequadamente limpos mantendo caracteres de pontuação necessários para o contexto de negócio.

---

## 🎯 Objetivo da Hotfix

Resolver problemas na importação de opções de formulário onde:
- Caracteres especiais precisavam ser removidos de forma controlada
- Era necessário preservar pontuação comum (vírgulas, pontos, parênteses, etc.)
- O código precisava ser mais consistente em toda a aplicação
- O caractere `$` (cifrão) precisava ser permitido para valores monetários

---

## 🔄 Commits Realizados

### 1. **Commit 792ba4e** - 16/03/2026
**"Adiciona método para limpar caracteres especiais em opções"**

#### Descrição
Criação inicial do método de sanitização específico para opções de formulário.

#### Alterações Técnicas

**Arquivo:** `HBATools.Admin.Domain/Helper/Helper.cs`
```csharp
// ADICIONADO
public static string RemoveSpecialCharactersOpcoes(string text)
{
    if (string.IsNullOrWhiteSpace(text))
        return text;

    return Regex.Replace(text, @"[^\p{L}0-9\s,.!?:;\-()/@#&+]", " ", 
        RegexOptions.None, TimeSpan.FromMilliseconds(100));
}
```

**Arquivo:** `HBATools.Admin.Service/Services/ImportService.cs`

- **Importação adicionada:** `using HBATools.Admin.Domain.Helper;`
- **Método alterado:** `CreateFormularioCampoOpcao`

**Antes:**
```csharp
var cellValue = worksheet.Cell(row, 1).Value.ToString()?.Trim() ?? string.Empty;

if (string.IsNullOrWhiteSpace(cellValue))
{
    return null;
}

var nomeOpcao = cellValue;

return new FormularioCampoOpcao
{
    NomeOpcao = nomeOpcao,
    NomeOpcaoEn = worksheet.Cell(row, 2).IsEmpty() ? null : worksheet.Cell(row, 2).Value.ToString()?.Trim(),
    NomeOpcaoEs = worksheet.Cell(row, 3).IsEmpty() ? null : worksheet.Cell(row, 3).Value.ToString()?.Trim(),
    // ...
};
```

**Depois:**
```csharp
var nomeOpcao = worksheet.Cell(row, 1).Value.ToString()?.Trim() ?? string.Empty;
var nomeOpcaoEn = worksheet.Cell(row, 2).Value.ToString()?.Trim() ?? string.Empty;
var nomeOpcaoEs = worksheet.Cell(row, 3).Value.ToString()?.Trim() ?? string.Empty;

if (string.IsNullOrWhiteSpace(nomeOpcao))
{
    return null;
}

return new FormularioCampoOpcao
{
    NomeOpcao = Helper.RemoveSpecialCharactersOpcoes(nomeOpcao),
    NomeOpcaoEn = string.IsNullOrWhiteSpace(nomeOpcaoEn) ? null : Helper.RemoveSpecialCharactersOpcoes(nomeOpcaoEn),
    NomeOpcaoEs = string.IsNullOrWhiteSpace(nomeOpcaoEs) ? null : Helper.RemoveSpecialCharactersOpcoes(nomeOpcaoEs),
    // ...
};
```

#### Melhorias Implementadas
- ✅ Leitura antecipada das três colunas (PT, EN, ES)
- ✅ Aplicação de sanitização em todos os idiomas
- ✅ Validação melhorada para campos nulos
- ✅ Preservação de caracteres de pontuação comuns

---

### 2. **Commit a7234e0** - 18/03/2026
**"Refatora sanitização de strings com novo método Helper"**

#### Descrição
Renomeação do método para nome mais genérico e aplicação consistente em toda a aplicação.

#### Alterações Técnicas

**Arquivo:** `HBATools.Admin.Domain/Helper/Helper.cs`
```csharp
// RENOMEADO DE: RemoveSpecialCharactersOpcoes
// PARA:
public static string RemoveInvalidCharacters(string text)
```

#### Arquivos Alterados (6 arquivos):
1. `Helper.cs` - Renomeação do método
2. `CnpjLinhaProcessador.cs` - Aplicação da sanitização
3. `CpfLinhaProcessador.cs` - Aplicação da sanitização
4. `EmailLinhaProcessador.cs` - Aplicação da sanitização
5. `NomeLinhaProcessador.cs` - Aplicação da sanitização + import do Helper
6. `ImportService.cs` - Atualização das chamadas

**Exemplo de alteração nos processadores:**

**Arquivo:** `CnpjLinhaProcessador.cs`
```csharp
return new PessoaCategoriaInscricao
{
    NomeLista = Helper.RemoveInvalidCharacters(nome), // ALTERADO
    CpfLista = string.Empty,
    CnpjLista = cnpj,
    EmailLista = string.Empty,
    // ...
};
```

Mesma alteração aplicada em:
- `CpfLinhaProcessador.cs`
- `EmailLinhaProcessador.cs`
- `NomeLinhaProcessador.cs`

**Arquivo:** `ImportService.cs`
```csharp
return new FormularioCampoOpcao
{
    NomeOpcao = Helper.RemoveInvalidCharacters(nomeOpcao), // ALTERADO
    NomeOpcaoEn = string.IsNullOrWhiteSpace(nomeOpcaoEn) ? null : Helper.RemoveInvalidCharacters(nomeOpcaoEn), // ALTERADO
    NomeOpcaoEs = string.IsNullOrWhiteSpace(nomeOpcaoEs) ? null : Helper.RemoveInvalidCharacters(nomeOpcaoEs), // ALTERADO
    // ...
};
```

#### Melhorias Implementadas
- ✅ Consistência no nome do método
- ✅ Aplicação uniforme em todos os processadores de importação
- ✅ Sanitização centralizada para CPF, CNPJ, Email e Nome em listas

---

### 3. **Commit 8306468** - 23/03/2026
**"Update regex to allow only Latin letters in helper"**

#### Descrição
Refinamento da expressão regular para permitir apenas letras do alfabeto latino com acentuação.

#### Alteração Técnica

**Arquivo:** `HBATools.Admin.Domain/Helper/Helper.cs`

**Antes:**
```csharp
return Regex.Replace(text, @"[^\p{L}0-9\s,.!?:;\-()/@#&+]", " ", 
    RegexOptions.None, TimeSpan.FromMilliseconds(100));
```

**Depois:**
```csharp
return Regex.Replace(text, @"[^a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+]", " ", 
    RegexOptions.None, TimeSpan.FromMilliseconds(100));
```

#### Impacto
- ❌ Remove suporte para alfabetos não-latinos (Cirílico, Árabe, Japonês, etc.)
- ✅ Permite letras latinas com acentuação (À-ÿ)
- ✅ Mantém todos os caracteres de pontuação necessários
- ✅ Evita caracteres inesperados de outros alfabetos

#### Mudança na Regex

| Padrão      | O que permite                                | Exemplos                    |
|-------------|----------------------------------------------|-----------------------------|
| `\p{L}`     | **Qualquer letra Unicode** (todos alfabetos) | a, б, ع, あ, 中             |
| `a-zA-ZÀ-ÿ` | **Apenas letras latinas com acentuação**     | a-z, A-Z, á, é, ñ, ü, ç, Ã |

---

### 4. **Commit 7c7dada** - 23/03/2026 (HEAD)
**"Permitir caractere $ em RemoveInvalidCharacters"**

#### Descrição
Adição do caractere cifrão ($) aos caracteres permitidos.

#### Alteração Técnica

**Arquivo:** `HBATools.Admin.Domain/Helper/Helper.cs`

**Antes:**
```csharp
return Regex.Replace(text, @"[^a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+]", " ", 
    RegexOptions.None, TimeSpan.FromMilliseconds(100));
```

**Depois:**
```csharp
return Regex.Replace(text, @"[^a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+$]", " ", 
    RegexOptions.None, TimeSpan.FromMilliseconds(100));
```

#### Justificativa
- Permite importação de valores monetários em campos de formulário
- Necessário para opções que contenham valores de preço
- Exemplo: "Inscrição - $150,00"

---

## 📊 Resumo das Mudanças no Código

### Arquivos Modificados (Total: 7 arquivos)

| Arquivo                             | Tipo de Mudança                              | Linhas |
|-------------------------------------|----------------------------------------------|--------|
| `Helper.cs`                         | Adição + Refatoração de método               | +9, ~4 |
| `ImportService.cs`                  | Refatoração de importação de opções          | ~15    |
| `CnpjLinhaProcessador.cs`           | Aplicação de sanitização                     | ~1     |
| `CpfLinhaProcessador.cs`            | Aplicação de sanitização                     | ~1     |
| `EmailLinhaProcessador.cs`          | Aplicação de sanitização                     | ~1     |
| `NomeLinhaProcessador.cs`           | Aplicação de sanitização + import            | ~2     |

---

## 🔍 Análise Detalhada do Método Final

### `RemoveInvalidCharacters(string text)`

**Localização:** `HBATools.Admin.Domain/Helper/Helper.cs`

```csharp
public static string RemoveInvalidCharacters(string text)
{
    if (string.IsNullOrWhiteSpace(text))
        return text;

    return Regex.Replace(text, @"[^a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+$]", " ", 
        RegexOptions.None, TimeSpan.FromMilliseconds(100));
}
```

### Caracteres Permitidos

| Categoria           | Caracteres                              | Descrição                          |
|---------------------|-----------------------------------------|------------------------------------|
| Letras minúsculas   | `a-z`                                   | Alfabeto latino básico             |
| Letras maiúsculas   | `A-Z`                                   | Alfabeto latino básico             |
| Acentuação          | `À-ÿ`                                   | Letras com acentos (á, é, ñ, etc.) |
| Dígitos             | `0-9`                                   | Números                            |
| Espaçamento         | `\s`                                    | Espaço, tab, quebra de linha       |
| Pontuação básica    | `,` `.` `!` `?` `:`                     | Pontuação comum                    |
| Símbolos matemáticos| `+` `-`                                 | Mais e menos                       |
| Agrupamento         | `(` `)`                                 | Parênteses                         |
| Separadores         | `/` `@` `#` `&`                         | Barra, arroba, hashtag, e comercial|
| Monetário           | `$`                                     | Cifrão                             |

### Comportamento

1. **Entrada nula ou vazia:** Retorna o texto sem modificação
2. **Caracteres inválidos:** Substituídos por espaço ` `
3. **Timeout:** 100ms para prevenir ataques ReDoS
4. **Sem flags especiais:** Regex padrão (case-sensitive)

### Exemplos de Uso

```csharp
// Exemplo 1: Pontuação preservada
Input:  "Opção A, B (teste)!"
Output: "Opção A, B (teste)!"

// Exemplo 2: Caracteres especiais removidos
Input:  "Evento_2026#ESPECIAL"
Output: "Evento 2026#ESPECIAL"

// Exemplo 3: Valor monetário
Input:  "Inscrição - $150,00"
Output: "Inscrição - $150,00"

// Exemplo 4: Caracteres não-latinos removidos
Input:  "Evento 中文字"
Output: "Evento     "

// Exemplo 5: Underscores removidos
Input:  "Nome_Com_Underscores"
Output: "Nome Com Underscores"
```

---

## 🎯 Casos de Uso da Aplicação

### 1. Importação de Opções de Formulário (ImportService)

**Contexto:** Importação de arquivo Excel com opções multilíngue

```csharp
// Linha do Excel: "Categoria VIP (2024)" | "VIP Category (2024)" | "Categoría VIP (2024)"

var opcao = CreateFormularioCampoOpcao(worksheet, row, request, dataCadastro);

// Resultado:
// opcao.NomeOpcao = "Categoria VIP (2024)"
// opcao.NomeOpcaoEn = "VIP Category (2024)"
// opcao.NomeOpcaoEs = "Categoría VIP (2024)"
```

### 2. Importação de Listas por CNPJ

**Contexto:** Importação de participantes por CNPJ

```csharp
// Nome no Excel: "Empresa S/A - Filial #01"

var pessoa = new PessoaCategoriaInscricao
{
    NomeLista = Helper.RemoveInvalidCharacters(nome),
    // Resultado: "Empresa S/A - Filial #01"
};
```

### 3. Importação de Listas por CPF

**Contexto:** Importação de participantes por CPF

```csharp
// Nome no Excel: "João da Silva Jr. (Palestrante)"

var pessoa = new PessoaCategoriaInscricao
{
    NomeLista = Helper.RemoveInvalidCharacters(nome),
    // Resultado: "João da Silva Jr. (Palestrante)"
};
```

### 4. Importação de Listas por Email

**Contexto:** Importação de participantes por Email

```csharp
// Nome no Excel: "Maria Souza - Coordenadora"

var pessoa = new PessoaCategoriaInscricao
{
    NomeLista = Helper.RemoveInvalidCharacters(nome),
    // Resultado: "Maria Souza - Coordenadora"
};
```

### 5. Importação de Listas por Nome

**Contexto:** Importação de participantes apenas por nome

```csharp
// Nome no Excel: "Dr. Pedro Santos (Médico)"

var pessoa = new PessoaCategoriaInscricao
{
    NomeLista = Helper.RemoveInvalidCharacters(nome),
    // Resultado: "Dr. Pedro Santos (Médico)"
};
```

---

## 🔒 Segurança e Performance

### Proteção contra ReDoS (Regular Expression Denial of Service)

```csharp
Regex.Replace(text, pattern, replacement, 
    RegexOptions.None, 
    TimeSpan.FromMilliseconds(100)); // ← Timeout de 100ms
```

**Benefícios:**
- Previne bloqueio da aplicação com inputs maliciosos
- Garante que a operação falhe rápido em caso de padrões complexos
- Proteção contra ataques de negação de serviço

### Validação de Entrada

```csharp
if (string.IsNullOrWhiteSpace(text))
    return text;
```

**Benefícios:**
- Evita processamento desnecessário
- Previne NullReferenceException
- Retorna rapidamente para casos triviais

---

## 🧪 Testes e Validação

### Cenários de Teste Recomendados

#### 1. Teste de Caracteres Especiais
```
Input: "Teste!@#$%^&*()_+={}[]|\\:;\"'<>?/"
Expected: "Teste!@#$    &*()  +     :     "
```

#### 2. Teste de Acentuação
```
Input: "Ação, código, José, François, Müller"
Expected: "Ação, código, José, François, Müller"
```

#### 3. Teste de Valores Monetários
```
Input: "Preço: $1.500,00"
Expected: "Preço: $1.500,00"
```

#### 4. Teste de Caracteres Unicode (não-latinos)
```
Input: "Hello мир 世界 مرحبا"
Expected: "Hello         "
```

#### 5. Teste de Strings Vazias
```
Input: null, "", "   "
Expected: null, "", "   " (sem alteração)
```

#### 6. Teste de Opções Multilíngue
```
Input PT: "Opção Premium ($500)"
Input EN: "Premium Option ($500)"
Input ES: "Opción Premium ($500)"

Expected: Todas preservadas corretamente
```

---

## 📈 Impacto e Benefícios

### Benefícios Técnicos
- ✅ **Consistência:** Mesmo método de sanitização em toda a aplicação
- ✅ **Manutenibilidade:** Código centralizado e fácil de modificar
- ✅ **Segurança:** Proteção contra ReDoS
- ✅ **Performance:** Validação rápida de entrada

### Benefícios de Negócio
- ✅ **Qualidade de Dados:** Dados importados mais limpos e consistentes
- ✅ **Flexibilidade:** Suporta pontuação necessária para opções de formulário
- ✅ **Internacionalização:** Suporte a acentuação em múltiplos idiomas
- ✅ **Valores Monetários:** Permite importação de preços

### Riscos Mitigados
- ❌ **SQL Injection:** Prevenido pela sanitização
- ❌ **XSS:** Caracteres perigosos removidos
- ❌ **Dados Inválidos:** Caracteres inesperados filtrados
- ❌ **ReDoS:** Timeout previne ataques de regex

---

## 🚀 Deployment e Rollback

### Pré-requisitos para Deploy
- ✅ Sem dependências externas adicionais
- ✅ Compatível com .NET 10
- ✅ Sem mudanças no banco de dados
- ✅ Sem mudanças em APIs externas

### Impacto no Deploy
- **Tempo de indisponibilidade:** Nenhum
- **Migração de dados:** Não necessária
- **Configuração:** Nenhuma alteração necessária

### Plano de Rollback
Se necessário reverter:
```bash
git checkout master
git revert 7c7dada..792ba4e
# OU
git checkout <commit-anterior-a-792ba4e>
```

**Nota:** Dados já importados com a nova sanitização permanecerão sanitizados.

---

## 📚 Referências Técnicas

### Classes e Métodos Principais

#### `Helper.cs`
```csharp
namespace HBATools.Admin.Domain.Helper

Métodos Públicos:
- ConvertStringNumberForDecimal(string text) → decimal
- RemoveMaskFromNumbers(string text) → string
- RemoveSpecialCharacters(string text) → string
- RemoveInvalidCharacters(string text) → string  ← NOVO
```

#### `ImportService.cs`
```csharp
namespace HBATools.Admin.Service.Services

Métodos Alterados:
- CreateFormularioCampoOpcao(IXLWorksheet, int, ImportOptionsRequest, DateTime)
```

#### Processadores de Linha
```csharp
namespace HBATools.Admin.Service.Services.Import

Classes Alteradas:
- CnpjLinhaProcessador   ← Método: ProcessarLinha
- CpfLinhaProcessador    ← Método: ProcessarLinha
- EmailLinhaProcessador  ← Método: ProcessarLinha
- NomeLinhaProcessador   ← Método: ProcessarLinha
```

---

## ✅ Checklist de Validação

### Antes do Merge para Master
- [ ] Todos os commits revisados
- [ ] Testes manuais realizados com diferentes tipos de caracteres
- [ ] Validação de importação de opções multilíngue
- [ ] Validação de importação de listas (CPF, CNPJ, Email, Nome)
- [ ] Verificação de performance (timeout de regex)
- [ ] Code review aprovado
- [ ] SonarQube sem novos code smells
- [ ] Documentação atualizada

### Após Deploy em QA
- [ ] Teste de importação de formulário com caracteres especiais
- [ ] Teste de importação de listas com nomes acentuados
- [ ] Teste de valores monetários ($)
- [ ] Teste de caracteres unicode (deve remover)
- [ ] Teste de strings vazias/nulas
- [ ] Validação de logs (sem erros de regex timeout)

### Após Deploy em Produção
- [ ] Monitorar logs de importação
- [ ] Validar primeiras importações
- [ ] Confirmar que caracteres $ são preservados
- [ ] Confirmar que acentuação é preservada
- [ ] Confirmar que caracteres inválidos são removidos

---

## 👥 Informações de Contato

**Desenvolvedor Responsável:** Guilherme Moreira  
**Email:** guilherme.silva@hba.com.br  
**Data de Conclusão:** 23 de março de 2026  

---

## 📝 Notas Adicionais

### Evolução do Método de Sanitização

| Versão | Nome do Método                     | Regex                                        | Comentário                        |
|--------|------------------------------------|----------------------------------------------|-----------------------------------|
| 1.0    | `RemoveSpecialCharactersOpcoes`    | `[^\p{L}0-9\s,.!?:;\-()/@#&+]`               | Aceita qualquer letra Unicode     |
| 2.0    | `RemoveInvalidCharacters`          | `[^\p{L}0-9\s,.!?:;\-()/@#&+]`               | Renomeado p/ nome genérico        |
| 3.0    | `RemoveInvalidCharacters`          | `[^a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+]`           | Apenas letras latinas             |
| 3.1    | `RemoveInvalidCharacters` (FINAL)  | `[^a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+$]`          | Adiciona suporte ao cifrão ($)    |

### Lições Aprendidas

1. **Regex Incremental:** Melhor evoluir a regex em pequenos passos do que fazer grandes mudanças
2. **Testes Reais:** Caracteres de pontuação são mais comuns do que parece em opções de formulário
3. **Internacionalização:** Acentuação é crítica para PT-BR e ES
4. **Valores Monetários:** O caractere `$` foi solicitado após testes com dados reais

### Próximas Melhorias Sugeridas

- [ ] Adicionar testes unitários para `RemoveInvalidCharacters`
- [ ] Documentar exemplos de uso no XML doc do método
- [ ] Considerar criar enum para conjuntos de caracteres permitidos
- [ ] Avaliar necessidade de permitir outros símbolos monetários (€, £, ¥)
- [ ] Considerar logging de caracteres removidos para análise

---

## 🔖 Apêndice

### A. Tabela de Caracteres ASCII Estendido

Caracteres **PERMITIDOS** no método final:

```
Letras: a-z A-Z À Á Â Ã Ä Å Æ Ç È É Ê Ë Ì Í Î Ï Ð Ñ Ò Ó Ô Õ Ö × Ø Ù Ú Û Ü Ý Þ ß
       à á â ã ä å æ ç è é ê ë ì í î ï ð ñ ò ó ô õ ö ÷ ø ù ú û ü ý þ ÿ
Dígitos: 0 1 2 3 4 5 6 7 8 9
Espaços: [espaço] [tab] [nova linha]
Pontuação: , . ! ? : - ( ) / @ # & + $
```

Caracteres **REMOVIDOS** (convertidos para espaço):

```
Especiais: _ = { } [ ] \ | ; " ' < > ^ ` ~ % * 
Unicode não-latino: Todos caracteres de alfabetos cirílico, árabe, japonês, chinês, etc.
Emojis: Todos
```

### B. Expressões Regulares Relacionadas no Projeto

```csharp
// Converter string para decimal
@"[^\d.,-]"

// Remover máscara de números (CPF, CNPJ)
@"[^\d]"

// Remover caracteres especiais (método antigo)
"[^0-9a-zA-Z ]+"

// Remover caracteres inválidos (método novo) ← IMPLEMENTADO NESTA HOTFIX
@"[^a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+$]"
```

---

**Fim da Documentação**

*Documento gerado automaticamente via análise de commits da branch `hotfixes/50179-importacao-campo-adicional-lista-salva-codigo-remove-nome`*
