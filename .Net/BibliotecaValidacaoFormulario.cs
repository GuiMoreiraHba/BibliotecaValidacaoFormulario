using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.RegularExpressions;

public class BibliotecaValidacaoFormulario
{
    private readonly Config _config;

    private readonly Regex _regexPermitidos =
        new Regex(@"^[a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+]*$", RegexOptions.Compiled);

    private readonly Dictionary<char, CaracterProibido> _caracteresProibidos =
        new Dictionary<char, CaracterProibido>
        {
            { ';', new("critico", "Separador de campos utilizado no processamento (split)") },
            { '_', new("critico", "Separador de identificador de campo") },
            { '|', new("alto", "Pipe pode quebrar processamento ou templates") },
            { '\\', new("alto", "Contra barra pode gerar escape inesperado") },
            { '<', new("alto", "Possível início de HTML/XSS") },
            { '>', new("alto", "Possível fechamento de HTML/XSS") },
            { '"', new("medio", "Aspas duplas podem quebrar atributos HTML") },
            { '\'', new("medio", "Aspas simples podem quebrar atributos HTML") },
            { '`', new("medio", "Template literal JS") },
            { '=', new("baixo", "Pode indicar atribuição ou manipulação de atributos") }
        };

    public BibliotecaValidacaoFormulario(Config config = null)
    {
        _config = config ?? new Config();
        Log("Biblioteca de validação inicializada", "info");
    }

    // ===========================
    // VALIDAÇÃO
    // ===========================
    public ResultadoValidacao ValidarCampo(string texto)
    {
        var sw = Stopwatch.StartNew();

        if (string.IsNullOrWhiteSpace(texto))
        {
            return new ResultadoValidacao
            {
                Valido = false,
                Motivo = "Campo vazio ou indefinido",
                Problemas = new List<Problema>(),
                RiscoGeral = "erro"
            };
        }

        var problemas = new List<Problema>();

        // caracteres proibidos
        for (int i = 0; i < texto.Length; i++)
        {
            var c = texto[i];

            if (_caracteresProibidos.TryGetValue(c, out var info))
            {
                problemas.Add(new Problema
                {
                    Tipo = "caractere_proibido",
                    Valor = c.ToString(),
                    Posicao = i,
                    Risco = info.Risco,
                    Descricao = info.Descricao
                });
            }
        }

        // fora da whitelist
        if (!_regexPermitidos.IsMatch(texto))
        {
            var matches = Regex.Matches(texto, @"[^a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+]");

            foreach (Match match in matches)
            {
                problemas.Add(new Problema
                {
                    Tipo = "caractere_nao_permitido",
                    Valor = match.Value,
                    Risco = "medio",
                    Descricao = "Caractere não permitido pelo padrão"
                });
            }
        }

        var resultado = new ResultadoValidacao
        {
            Valido = !problemas.Any(),
            Problemas = problemas,
            RiscoGeral = CalcularRisco(problemas),
            TempoValidacao = sw.ElapsedMilliseconds
        };

        LogResultado(resultado, texto);

        return resultado;
    }

    // ===========================
    // SANITIZAÇÃO
    // ===========================
    public string SanitizarCampo(string texto)
    {
        if (string.IsNullOrEmpty(texto)) return string.Empty;

        var sanitizado = Regex.Replace(texto, @"[^a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+]", "");

        Log($"Texto sanitizado: \"{texto}\" -> \"{sanitizado}\"", "warn");

        return sanitizado;
    }

    // ===========================
    // VALIDAÇÃO EM LOTE
    // ===========================
    public ResultadoLote ValidarLote(IEnumerable<string> campos)
    {
        var sw = Stopwatch.StartNew();

        var resultados = campos.Select(ValidarCampo).ToList();

        var validos = resultados.Count(r => r.Valido);
        var invalidos = resultados.Count - validos;

        Log($"Validação em lote: {validos} válidos, {invalidos} inválidos", "info");

        return new ResultadoLote
        {
            Resultados = resultados,
            Resumo = new Resumo
            {
                Total = resultados.Count,
                Validos = validos,
                Invalidos = invalidos,
                TempoTotal = sw.ElapsedMilliseconds
            }
        };
    }

    // ===========================
    // PRIVADOS
    // ===========================
    private string CalcularRisco(List<Problema> problemas)
    {
        if (!problemas.Any()) return "nenhum";

        var ordem = new[] { "critico", "alto", "medio", "baixo" };

        foreach (var nivel in ordem)
        {
            if (problemas.Any(p => p.Risco == nivel))
                return nivel;
        }

        return "baixo";
    }

    private void LogResultado(ResultadoValidacao resultado, string texto)
    {
        if (resultado.Valido)
        {
            Log($"Campo válido: \"{texto}\"", "success");
        }
        else
        {
            Log($"Campo rejeitado - Risco {resultado.RiscoGeral.ToUpper()}", "error");

            for (int i = 0; i < resultado.Problemas.Count; i++)
            {
                var p = resultado.Problemas[i];
                Log($"{i + 1}. \"{p.Valor}\" pos:{p.Posicao} - {p.Descricao}", "warn");
            }
        }
    }

    private void Log(string mensagem, string tipo)
    {
        if (!_config.LogVerbose && tipo == "info") return;

        var prefix = _config.LogPrefix;
        var timestamp = DateTime.Now.ToString("HH:mm:ss");

        Console.WriteLine($"{prefix} [{timestamp}] {mensagem}");
    }
}