# Biblioteca de Validação de Formulário - C#

## 📋 Descrição

Biblioteca C# para validação e sanitização de campos de formulário, com detecção de caracteres proibidos, análise de risco e proteção contra XSS/injeção de código.

## 🏗️ Estrutura das Classes

### Classes Principais

- **BibliotecaValidacaoFormulario**: Classe principal com métodos de validação e sanitização
- **ResultadoValidacao**: Retorna o resultado da validação de um campo
- **ResultadoLote**: Retorna o resultado da validação em lote
- **Problema**: Representa um problema encontrado na validação
- **Config**: Configurações da biblioteca
- **CaracterProibido**: Informações sobre caracteres proibidos
- **Resumo**: Resumo estatístico de validações em lote

## 🚀 Como Usar

### 1. Adicionar os Arquivos ao Projeto

Copie todos os arquivos `.cs` para o seu projeto:
- BibliotecaValidacaoFormulario.cs
- CaracterProibido.cs
- Config.cs
- Problema.cs
- ResultadoLote.cs
- ResultadoValidacao.cs
- Resumo.cs

### 2. Uso Básico

```csharp
// Criar instância da biblioteca
var validador = new BibliotecaValidacaoFormulario();

// Validar um campo
string texto = "João da Silva";
var resultado = validador.ValidarCampo(texto);

if (resultado.Valido)
{
    Console.WriteLine("Campo válido!");
}
else
{
    Console.WriteLine($"Campo inválido - Risco: {resultado.RiscoGeral}");
    foreach (var problema in resultado.Problemas)
    {
        Console.WriteLine($"- {problema.Descricao} (posição {problema.Posicao})");
    }
}
```

### 3. Validação com Configuração Personalizada

```csharp
// Criar configuração personalizada
var config = new Config
{
    LogVerbose = false,  // Desabilita logs detalhados
    LogPrefix = "[MeuApp]"  // Personaliza o prefixo dos logs
};

// Criar validador com configuração
var validador = new BibliotecaValidacaoFormulario(config);

var resultado = validador.ValidarCampo("Email: teste@exemplo.com");
```

### 4. Sanitização de Campo

```csharp
var validador = new BibliotecaValidacaoFormulario();

// Texto com caracteres problemáticos
string textoSujo = "João<script>alert('xss')</script>";

// Remove caracteres não permitidos
string textoLimpo = validador.SanitizarCampo(textoSujo);

Console.WriteLine(textoLimpo); // Saída: "Jooscriptalert'xss'script"
```

### 5. Validação em Lote

```csharp
var validador = new BibliotecaValidacaoFormulario();

// Lista de campos para validar
var campos = new List<string>
{
    "João da Silva",
    "Maria & Joaquim",
    "Teste<script>",
    "Email válido",
    "Nome;Sobrenome"  // contém ;
};

// Validar todos os campos
var resultadoLote = validador.ValidarLote(campos);

// Exibir resumo
Console.WriteLine($"Total: {resultadoLote.Resumo.Total}");
Console.WriteLine($"Válidos: {resultadoLote.Resumo.Validos}");
Console.WriteLine($"Inválidos: {resultadoLote.Resumo.Invalidos}");
Console.WriteLine($"Tempo total: {resultadoLote.Resumo.TempoTotal}ms");

// Analisar cada resultado individualmente
for (int i = 0; i < resultadoLote.Resultados.Count; i++)
{
    var res = resultadoLote.Resultados[i];
    Console.WriteLine($"\nCampo {i + 1}: {(res.Valido ? "✓ VÁLIDO" : "✗ INVÁLIDO")}");
    
    if (!res.Valido)
    {
        Console.WriteLine($"  Risco: {res.RiscoGeral}");
        foreach (var problema in res.Problemas)
        {
            Console.WriteLine($"  - {problema.Valor}: {problema.Descricao}");
        }
    }
}
```

## 📊 Estrutura de Retorno

### ResultadoValidacao

```csharp
public class ResultadoValidacao
{
    public bool Valido { get; set; }          // true se o campo é válido
    public string Motivo { get; set; }        // Motivo da rejeição (se inválido)
    public string RiscoGeral { get; set; }    // "nenhum", "baixo", "medio", "alto", "critico"
    public List<Problema> Problemas { get; set; }  // Lista de problemas encontrados
    public long TempoValidacao { get; set; }  // Tempo de validação em ms
}
```

### Problema

```csharp
public class Problema
{
    public string Tipo { get; set; }        // "caractere_proibido" ou "caractere_nao_permitido"
    public string Valor { get; set; }       // O caractere problemático
    public int Posicao { get; set; }        // Posição no texto
    public string Risco { get; set; }       // Nível de risco
    public string Descricao { get; set; }   // Descrição do problema
}
```

### ResultadoLote

```csharp
public class ResultadoLote
{
    public List<ResultadoValidacao> Resultados { get; set; }  // Resultado de cada campo
    public Resumo Resumo { get; set; }                        // Estatísticas gerais
}
```

### Resumo

```csharp
public class Resumo
{
    public int Total { get; set; }       // Total de campos validados
    public int Validos { get; set; }     // Quantidade de campos válidos
    public int Invalidos { get; set; }   // Quantidade de campos inválidos
    public long TempoTotal { get; set; } // Tempo total de processamento em ms
}
```

## 🔒 Caracteres Proibidos e Níveis de Risco

| Caractere | Risco    | Motivo                                               |
|-----------|----------|------------------------------------------------------|
| `;`       | Crítico  | Separador de campos (split)                          |
| `_`       | Crítico  | Separador de identificador de campo                  |
| `\|`      | Alto     | Pipe pode quebrar processamento                      |
| `\`       | Alto     | Contra barra pode gerar escape inesperado            |
| `<`       | Alto     | Possível início de HTML/XSS                          |
| `>`       | Alto     | Possível fechamento de HTML/XSS                      |
| `"`       | Médio    | Aspas duplas podem quebrar atributos HTML            |
| `'`       | Médio    | Aspas simples podem quebrar atributos HTML           |
| `` ` ``   | Médio    | Template literal JS                                  |
| `=`       | Baixo    | Pode indicar atribuição ou manipulação de atributos  |

## ✅ Caracteres Permitidos

A biblioteca permite os seguintes caracteres:

- Letras maiúsculas e minúsculas: `a-z`, `A-Z`
- Letras acentuadas: `À-ÿ`
- Números: `0-9`
- Espaços
- Pontuação: `,`, `.`, `!`, `?`, `:`
- Símbolos especiais: `-`, `(`, `)`, `/`, `@`, `#`, `&`, `+`

## 🔧 Configuração

```csharp
public class Config
{
    public bool LogVerbose { get; set; } = true;           // Exibir logs detalhados
    public string LogPrefix { get; set; } = "[ValidacaoFormulario]";  // Prefixo dos logs
}
```

### Exemplo de Configuração

```csharp
// Desabilitar logs em produção
var config = new Config
{
    LogVerbose = false,
    LogPrefix = "[AppProd]"
};

var validador = new BibliotecaValidacaoFormulario(config);
```

## 📝 Exemplos Práticos

### Exemplo 1: Validar Formulário de Cadastro

```csharp
var validador = new BibliotecaValidacaoFormulario();

// Campos do formulário
string nome = "João da Silva";
string email = "joao@exemplo.com";
string mensagem = "Olá, gostaria de mais informações!";

// Validar todos os campos
var campos = new[] { nome, email, mensagem };
var resultado = validador.ValidarLote(campos);

if (resultado.Resumo.Invalidos == 0)
{
    Console.WriteLine("Formulário válido! Processando...");
    // Processar dados
}
else
{
    Console.WriteLine("Formulário contém erros:");
    for (int i = 0; i < resultado.Resultados.Count; i++)
    {
        if (!resultado.Resultados[i].Valido)
        {
            Console.WriteLine($"Campo {i + 1}: {resultado.Resultados[i].RiscoGeral}");
        }
    }
}
```

### Exemplo 2: API/Controller com Validação

```csharp
public class FormularioController
{
    private readonly BibliotecaValidacaoFormulario _validador;

    public FormularioController()
    {
        _validador = new BibliotecaValidacaoFormulario(new Config
        {
            LogVerbose = false  // Desabilitar logs no controller
        });
    }

    public ActionResult EnviarFormulario(string nome, string mensagem)
    {
        // Validar campos
        var resultadoNome = _validador.ValidarCampo(nome);
        var resultadoMensagem = _validador.ValidarCampo(mensagem);

        if (!resultadoNome.Valido)
        {
            return BadRequest(new
            {
                Campo = "nome",
                Erro = "Nome contém caracteres inválidos",
                Risco = resultadoNome.RiscoGeral,
                Problemas = resultadoNome.Problemas
            });
        }

        if (!resultadoMensagem.Valido)
        {
            return BadRequest(new
            {
                Campo = "mensagem",
                Erro = "Mensagem contém caracteres inválidos",
                Risco = resultadoMensagem.RiscoGeral,
                Problemas = resultadoMensagem.Problemas
            });
        }

        // Processar formulário válido
        return Ok(new { Mensagem = "Formulário enviado com sucesso!" });
    }
}
```

### Exemplo 3: Sanitizar Entrada do Usuário

```csharp
var validador = new BibliotecaValidacaoFormulario();

// Entrada do usuário potencialmente perigosa
string entradaUsuario = "Nome<script>alert('xss')</script>; DROP TABLE users;";

// Primeira tentativa: validar
var resultado = validador.ValidarCampo(entradaUsuario);

if (!resultado.Valido)
{
    Console.WriteLine("Entrada inválida detectada!");
    Console.WriteLine($"Risco: {resultado.RiscoGeral}");
    
    // Sanitizar automaticamente
    string textoLimpo = validador.SanitizarCampo(entradaUsuario);
    Console.WriteLine($"Texto sanitizado: {textoLimpo}");
    
    // Validar texto sanitizado
    var resultadoLimpo = validador.ValidarCampo(textoLimpo);
    
    if (resultadoLimpo.Valido)
    {
        Console.WriteLine("Texto sanitizado está válido!");
    }
}
```

### Exemplo 4: Análise Detalhada de Problemas

```csharp
var validador = new BibliotecaValidacaoFormulario();

string texto = "SQL: SELECT * FROM users WHERE id='1' OR '1'='1';";

var resultado = validador.ValidarCampo(texto);

Console.WriteLine($"Válido: {resultado.Valido}");
Console.WriteLine($"Risco Geral: {resultado.RiscoGeral}");
Console.WriteLine($"Tempo de validação: {resultado.TempoValidacao}ms");
Console.WriteLine($"\nProblemas encontrados: {resultado.Problemas.Count}");

// Agrupar por nível de risco
var problemasAgrupados = resultado.Problemas
    .GroupBy(p => p.Risco)
    .OrderByDescending(g => g.Key);

foreach (var grupo in problemasAgrupados)
{
    Console.WriteLine($"\nRisco {grupo.Key.ToUpper()}:");
    foreach (var problema in grupo)
    {
        Console.WriteLine($"  - '{problema.Valor}' na posição {problema.Posicao}: {problema.Descricao}");
    }
}
```

## 🎯 Casos de Uso

### ✅ Quando Usar

- Validar campos de formulários web
- Proteger contra XSS e injeção de código
- Sanitizar entrada de usuários
- Validar dados antes de salvar no banco
- Validar campos em APIs REST
- Processar arquivos CSV/dados importados

### ❌ Limitações

- A biblioteca **não** valida regras de negócio (ex: CPF, email válido)
- A biblioteca **não** valida tamanho de campo
- A biblioteca **não** valida formatos específicos (ex: datas, telefones)
- Foco em segurança e caracteres proibidos

## 📊 Performance

A biblioteca utiliza `Stopwatch` para medir o tempo de validação:

```csharp
var resultado = validador.ValidarCampo("Texto longo...");
Console.WriteLine($"Validação concluída em {resultado.TempoValidacao}ms");
```

Para validação em lote:

```csharp
var resultadoLote = validador.ValidarLote(campos);
Console.WriteLine($"Validados {resultadoLote.Resumo.Total} campos em {resultadoLote.Resumo.TempoTotal}ms");
```

## 🛡️ Segurança

A biblioteca protege contra:

- ✅ Injeção de SQL (caracteres `;`, `'`, `"`)
- ✅ Cross-Site Scripting (XSS) - `<`, `>`, `<script>`
- ✅ Manipulação de templates (`` ` ``)
- ✅ Quebra de processamento (`;`, `_`, `|`)
- ✅ Escape inesperado (`\`)

## 📝 Licença

Este código foi desenvolvido como POC (Proof of Concept) para validação de formulários.

## 🤝 Contribuindo

Para adicionar novos caracteres proibidos, edite o dicionário `_caracteresProibidos` em [BibliotecaValidacaoFormulario.cs](BibliotecaValidacaoFormulario.cs):

```csharp
private readonly Dictionary<char, CaracterProibido> _caracteresProibidos =
    new Dictionary<char, CaracterProibido>
    {
        { ';', new("critico", "Separador de campos") },
        // Adicionar novos caracteres aqui
    };
```

## 📚 Referências

- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

---

**Desenvolvido para:** HBA TECNOLOGIA  
**Data:** Março 2026  
**Versão:** 2.0.0 (C# Port)
