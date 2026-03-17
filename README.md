# 📝 Biblioteca de Validação de Formulário

> Biblioteca JavaScript para validação e sanitização de campos de formulário, prevenindo quebra de parsing em sistemas que utilizam separadores específicos.

[![Versão](https://img.shields.io/badge/versão-1.0.0-blue.svg)](https://github.com/hba/biblioteca-validacao-formulario)
[![Licença](https://img.shields.io/badge/licença-MIT-green.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](https://www.ecma-international.org/)

---

## 📋 Índice

- [Sobre](#-sobre)
- [Problema que Resolve](#-problema-que-resolve)
- [Instalação](#-instalação)
- [Uso Rápido](#-uso-rápido)
- [Exemplos Práticos](#-exemplos-práticos)
- [API Completa](#-api-completa)
- [Caracteres Validados](#-caracteres-validados)
- [Configuração](#️-configuração)
- [Casos de Teste](#-casos-de-teste)
- [Compatibilidade](#-compatibilidade)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre

A **Biblioteca de Validação de Formulário** é uma solução JavaScript standalone (sem dependências) criada para prevenir problemas de importação e processamento de dados causados por caracteres especiais em sistemas que utilizam separadores como `;` (ponto e vírgula) e `_` (underline).

### ✨ Características

- ✅ **Zero dependências** — Biblioteca standalone
- ✅ **Validação em tempo real** — Bloqueia caracteres proibidos durante digitação
- ✅ **Sanitização automática** — Remove caracteres inválidos de strings
- ✅ **Validação em lote** — Processa múltiplos campos simultaneamente
- ✅ **Performance otimizada** — Validação < 5ms por campo
- ✅ **Logs detalhados** — Sistema de logging configurável
- ✅ **Feedback visual** — Integração fácil com formulários HTML
- ✅ **Multilíngue** — Suporta caracteres acentuados (PT, EN, ES)

---

## 🚨 Problema que Resolve

Sistemas que utilizam separadores específicos para processar dados (ex: importação de planilhas, parsing de strings) podem quebrar quando usuários inserem certos caracteres especiais.

### Caracteres Críticos

| Caractere | Problema |
|-----------|----------|
| `;` | Quebra separação de campos (usado em split) |
| `_` | Quebra identificação de campos (separador de ID) |
| `\|` | Quebra processamento de templates |
| `\` | Gera escape inesperado |
| `<` `>` | Vulnerabilidade XSS |
| `"` `'` `` ` `` | Quebra atributos HTML/JS |

### Consequências

- ❌ Importação de planilhas falha
- ❌ Corrupção de dados no banco
- ❌ Processamento incorreto de listas
- ❌ Vulnerabilidades de segurança

---

## 📦 Instalação

### Opção 1: Incluir diretamente no HTML

```html
<script src="path/to/BibliotecaValidacaoFormulario.js"></script>
```

### Opção 2: Importar como módulo (Node.js)

```javascript
const BibliotecaValidacaoFormulario = require('./BibliotecaValidacaoFormulario.js');
```

### Opção 3: Copiar para seu projeto

Baixe o arquivo `BibliotecaValidacaoFormulario.js` e inclua no seu projeto.

---

## 🚀 Uso Rápido

### Validação Simples

```javascript
// Criar instância
const validador = new BibliotecaValidacaoFormulario();

// Validar um campo
const resultado = validador.validarCampo('Categoria_Nova');

if (!resultado.valido) {
    console.log('Campo inválido!');
    resultado.problemas.forEach(p => {
        console.log(`Caractere "${p.valor}" não permitido: ${p.descricao}`);
    });
}
```

### Sanitização

```javascript
const validador = new BibliotecaValidacaoFormulario();

// Remove caracteres proibidos automaticamente
const texto = 'Categoria_Nova; com <script>';
const textoLimpo = validador.sanitizarCampo(texto);

console.log(textoLimpo); 
// Saída: "Categoria Nova com script"
```

### Bloqueio em Tempo Real

```javascript
const validador = new BibliotecaValidacaoFormulario();

// Aplica ao input HTML
const input = document.getElementById('nomeCategoria');
validador.aplicarBloqueioInput(input);

// Agora o usuário não consegue digitar caracteres proibidos!
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Formulário de Cadastro

```html
<!DOCTYPE html>
<html>
<head>
    <title>Cadastro de Categoria</title>
    <script src="BibliotecaValidacaoFormulario.js"></script>
</head>
<body>
    <form id="formCategoria">
        <label>Nome da Categoria (BR):</label>
        <input type="text" id="categoriaBR" required>
        
        <label>Nome da Categoria (EN):</label>
        <input type="text" id="categoriaEN" required>
        
        <label>Nome da Categoria (ES):</label>
        <input type="text" id="categoriaES" required>
        
        <button type="submit">Salvar</button>
    </form>

    <script>
        const validador = new BibliotecaValidacaoFormulario({
            logVerbose: true
        });

        // Aplicar validação em todos os campos
        ['categoriaBR', 'categoriaEN', 'categoriaES'].forEach(id => {
            validador.aplicarBloqueioInput(document.getElementById(id));
        });

        // Validar antes de enviar
        document.getElementById('formCategoria').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const br = document.getElementById('categoriaBR').value;
            const en = document.getElementById('categoriaEN').value;
            const es = document.getElementById('categoriaES').value;
            
            const campos = [br, en, es];
            const resultado = validador.validarLote(campos);
            
            if (resultado.resumo.invalidos === 0) {
                alert('Todos os campos são válidos! Enviando...');
                // Enviar formulário
            } else {
                alert('Existem campos inválidos. Verifique!');
            }
        });
    </script>
</body>
</html>
```

---

### Exemplo 2: Importação de Planilha

```javascript
const validador = new BibliotecaValidacaoFormulario();

function processarImportacao(dadosPlanilha) {
    const relatorio = {
        total: dadosPlanilha.length,
        sanitizados: 0,
        alteracoes: []
    };
    
    // Processar cada linha
    const dadosProcessados = dadosPlanilha.map((linha, index) => {
        const original = linha.nome;
        const sanitizado = validador.sanitizarCampo(linha.nome);
        
        if (original !== sanitizado) {
            relatorio.sanitizados++;
            relatorio.alteracoes.push({
                linha: index + 1,
                campo: 'nome',
                de: original,
                para: sanitizado
            });
        }
        
        return {
            ...linha,
            nome: sanitizado
        };
    });
    
    // Exibir relatório ao usuário
    if (relatorio.sanitizados > 0) {
        console.log(`⚠️ ${relatorio.sanitizados} de ${relatorio.total} registros foram sanitizados`);
        console.table(relatorio.alteracoes);
    }
    
    return dadosProcessados;
}

// Uso
const dados = [
    { nome: 'João_Silva', cpf: '12345678900' },
    { nome: 'Maria;Santos', cpf: '98765432100' },
    { nome: 'Pedro Costa', cpf: '11122233344' }
];

const dadosLimpos = processarImportacao(dados);
```

---

### Exemplo 3: Validação com Feedback Visual

```javascript
function validarComFeedback(inputElement) {
    const validador = new BibliotecaValidacaoFormulario();
    const resultado = validador.validarCampo(inputElement.value);
    
    // Remover classes anteriores
    inputElement.classList.remove('is-valid', 'is-invalid');
    
    if (resultado.valido) {
        inputElement.classList.add('is-valid');
        inputElement.setCustomValidity('');
    } else {
        inputElement.classList.add('is-invalid');
        
        const mensagens = resultado.problemas.map(p => 
            `Caractere "${p.valor}": ${p.descricao}`
        ).join('\n');
        
        inputElement.setCustomValidity(mensagens);
    }
    
    return resultado.valido;
}

// Aplicar em todos os inputs com classe .validar
document.querySelectorAll('.validar').forEach(input => {
    input.addEventListener('blur', () => validarComFeedback(input));
});
```

---

### Exemplo 4: Validação em Lote (Performance)

```javascript
const validador = new BibliotecaValidacaoFormulario();

// Processar 1000 campos de uma vez
const campos = [
    'Opção_1', 'Opção;2', 'Opção 3', 'Opção|4', 
    // ... mais 996 campos
];

const resultado = validador.validarLote(campos);

console.log(`
📊 Resultado da Validação em Lote:
   Total: ${resultado.resumo.total}
   Válidos: ${resultado.resumo.validos}
   Inválidos: ${resultado.resumo.invalidos}
   Tempo: ${resultado.resumo.tempoTotal}ms
`);

// Obter apenas campos inválidos
const camposInvalidos = resultado.resultados
    .map((res, index) => ({ campo: campos[index], resultado: res }))
    .filter(item => !item.resultado.valido);

console.table(camposInvalidos);
```

---

## 📚 API Completa

### Constructor

```javascript
new BibliotecaValidacaoFormulario(options)
```

**Parâmetros:**

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `options.logVerbose` | Boolean | `true` | Ativar logs detalhados |
| `options.logPrefix` | String | `'📝 [ValidacaoFormulario]'` | Prefixo dos logs |
| `options.logColors` | Boolean | `true` | Logs com cores no console |

**Exemplo:**

```javascript
const validador = new BibliotecaValidacaoFormulario({
    logVerbose: false,
    logPrefix: '[MinhaApp]',
    logColors: true
});
```

---

### validarCampo(texto)

Valida um campo de texto e retorna informações detalhadas sobre caracteres proibidos.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `texto` | String | Texto a ser validado |

**Retorno:**

```javascript
{
    valido: Boolean,           // true se campo é válido
    riscoGeral: String,        // 'nenhum', 'baixo', 'medio', 'alto', 'critico'
    problemas: Array,          // Lista de problemas encontrados
    tempoValidacao: Number     // Tempo em ms
}
```

**Exemplo:**

```javascript
const resultado = validador.validarCampo('Categoria_Nova');

if (!resultado.valido) {
    console.log(`Risco: ${resultado.riscoGeral}`);
    resultado.problemas.forEach(p => {
        console.log(`${p.valor} na posição ${p.posicao}: ${p.descricao}`);
    });
}
```

---

### sanitizarCampo(texto)

Remove todos os caracteres não permitidos de um texto.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `texto` | String | Texto a ser sanitizado |

**Retorno:** String (texto limpo)

**Exemplo:**

```javascript
const original = 'Categoria_Nova; test';
const limpo = validador.sanitizarCampo(original);

console.log(limpo); // "Categoria Nova test"
```

---

### aplicarBloqueioInput(inputElement)

Aplica validação em tempo real a um elemento `<input>` ou `<textarea>`.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `inputElement` | HTMLElement | Elemento de input do DOM |

**Retorno:** void

**Exemplo:**

```javascript
const input = document.getElementById('nomeCategoria');
validador.aplicarBloqueioInput(input);
```

---

### validarLote(campos)

Valida múltiplos campos de uma vez (otimizado para performance).

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `campos` | Array<String> | Array de textos a validar |

**Retorno:**

```javascript
{
    resultados: Array,         // Resultado individual de cada campo
    resumo: {
        total: Number,
        validos: Number,
        invalidos: Number,
        tempoTotal: Number
    }
}
```

**Exemplo:**

```javascript
const campos = ['Opção 1', 'Opção_2', 'Opção 3'];
const resultado = validador.validarLote(campos);

console.log(`${resultado.resumo.validos}/${resultado.resumo.total} válidos`);
```

---

## 🔍 Caracteres Validados

### ✅ Caracteres Permitidos

A biblioteca utiliza a seguinte regex:

```javascript
/^[a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+]*$/
```

**Permitidos:**

- Letras: `a-z`, `A-Z`
- Letras acentuadas: `À-ÿ` (português, espanhol, etc.)
- Números: `0-9`
- Espaços
- Pontuação: `,` `.` `!` `?` `:`
- Símbolos: `-` `(` `)` `/` `@` `#` `&` `+`

---

### ❌ Caracteres Proibidos

| Caractere | Risco | Motivo |
|-----------|-------|--------|
| `;` | **Crítico** | Separador de campos (split) |
| `_` | **Crítico** | Separador de identificador |
| `\|` | Alto | Quebra templates |
| `\` | Alto | Escape inesperado |
| `<` `>` | Alto | XSS / HTML injection |
| `"` `'` `` ` `` | Médio | Quebra atributos |
| `=` | Baixo | Manipulação de atributos |

---

## ⚙️ Configuração

### Modo Desenvolvimento

```javascript
const validador = new BibliotecaValidacaoFormulario({
    logVerbose: true,
    logColors: true
});
```

Logs detalhados no console com cores:
- 🔵 Info (azul)
- ✅ Success (verde)
- ⚠️ Warning (laranja)
- ❌ Error (vermelho)

---

### Modo Produção

```javascript
const validador = new BibliotecaValidacaoFormulario({
    logVerbose: false
});
```

Apenas logs de erro são exibidos.

---

## 🧪 Casos de Teste

### Teste 1: Campo Válido

```javascript
validador.validarCampo('Nova Categoria');
// { valido: true, riscoGeral: 'nenhum', problemas: [] }
```

### Teste 2: Campo com Underline

```javascript
validador.validarCampo('Categoria_Nova');
// { valido: false, riscoGeral: 'critico', problemas: [...] }
```

### Teste 3: Campo com Ponto e Vírgula

```javascript
validador.validarCampo('Categoria; Nova');
// { valido: false, riscoGeral: 'critico', problemas: [...] }
```

### Teste 4: Campo com Acentuação (Válido)

```javascript
validador.validarCampo('Categoría Española');
// { valido: true, riscoGeral: 'nenhum', problemas: [] }
```

### Teste 5: Sanitização

```javascript
validador.sanitizarCampo('Categoria_Nova; teste');
// "Categoria Nova teste"
```

### Teste 6: Validação em Lote

```javascript
validador.validarLote(['Opção 1', 'Opção_2', 'Opção 3']);
// { resumo: { total: 3, validos: 2, invalidos: 1 } }
```

---

## 🌐 Compatibilidade

### Navegadores

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

### Ambientes

- ✅ Browser (ES6+)
- ✅ Node.js 14+
- ✅ Frameworks: React, Vue, Angular, etc.

### Dependências

- **Nenhuma** — Biblioteca 100% standalone

---

## 📈 Performance

| Operação | Tempo Médio |
|----------|-------------|
| Validação simples | < 2ms |
| Sanitização | < 3ms |
| Validação em lote (100 campos) | < 50ms |
| Validação em lote (1000 campos) | < 400ms |

*Medições em processador Intel Core i5-8250U @ 1.60GHz*

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use ESLint para linting
- Mantenha compatibilidade ES6+
- Adicione testes para novas features
- Atualize a documentação

---

## 📝 Changelog

### v1.0.0 (2026-03-16)

- ✨ Release inicial
- ✅ Validação de caracteres proibidos
- ✅ Sanitização automática
- ✅ Bloqueio em tempo real
- ✅ Validação em lote
- ✅ Sistema de logs configurável
- ✅ Suporte a múltiplos idiomas

---

## 📄 Licença

Este projeto está sob a licença **MIT**.

```
MIT License

Copyright (c) 2026 HBA Tecnologia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Autores

- **Sistema de Validação HBA** - *Desenvolvimento inicial*
- **HBA Tecnologia** - *Organização*

---

## 📞 Suporte

Para dúvidas, sugestões ou reportar problemas:

- 📧 Email: suporte@hbatecnologia.com.br
- 🐛 Issues: [GitHub Issues](https://github.com/hba/biblioteca-validacao-formulario/issues)
- 📖 Documentação: [Documentacao.md](./Documentacao.md)
- 📋 Planejamento: [PLANEJAMENTO-TRATAMENTO-CARACTERES-ESPECIAIS.md](./PLANEJAMENTO-TRATAMENTO-CARACTERES-ESPECIAIS.md)

---

## 🔗 Links Relacionados

- [Documentação Técnica](./Documentacao.md)
- [Planejamento da Sprint](./PLANEJAMENTO-TRATAMENTO-CARACTERES-ESPECIAIS.md)
- [Código Fonte](./BibliotecaValidacaoFormulario.js)

---

<p align="center">
  Desenvolvido com ❤️ por <strong>HBA Tecnologia</strong>
</p>

<p align="center">
  <sub>2026 - Biblioteca de Validação de Formulário</sub>
</p>
