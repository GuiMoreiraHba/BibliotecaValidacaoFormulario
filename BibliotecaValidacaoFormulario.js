/**
 * ================================================================
 *  Biblioteca de Validação de Campos de Formulário
 *  ------------------------------------------------------------
 *  Descrição:
 *  Biblioteca para validação e sanitização de campos de formulário
 *  prevenindo quebra de parsing em sistemas que utilizam separadores
 *  como ";" e identificadores com "_".
 *
 *  Autor: Sistema de Validação HBA
 *  Versão: 1.0.0
 *  Criado em: 2026-03-16
 *
 *  Licença: MIT
 * ================================================================
 */

class BibliotecaValidacaoFormulario {

    constructor(options = {}) {

        this.config = {
            logVerbose: options.logVerbose !== false,
            logPrefix: options.logPrefix || '📝 [ValidacaoFormulario]',
            logColors: options.logColors !== false
        };

        /**
         * Regex de caracteres permitidos
         */
        this.regexPermitidos = /^[a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+]*$/;

        /**
         * Caracteres proibidos para evitar quebra do processamento
         */
        this.caracteresProibidos = {
            ';': { risco: 'critico', descricao: 'Separador de campos utilizado no processamento (split)' },
            '_': { risco: 'critico', descricao: 'Separador de identificador de campo' },
            '|': { risco: 'alto', descricao: 'Pipe pode quebrar processamento ou templates' },
            '\\': { risco: 'alto', descricao: 'Contra barra pode gerar escape inesperado' },
            '<': { risco: 'alto', descricao: 'Possível início de HTML/XSS' },
            '>': { risco: 'alto', descricao: 'Possível fechamento de HTML/XSS' },
            '"': { risco: 'medio', descricao: 'Aspas duplas podem quebrar atributos HTML' },
            "'": { risco: 'medio', descricao: 'Aspas simples podem quebrar atributos HTML' },
            '`': { risco: 'medio', descricao: 'Template literal JS' },
            '=': { risco: 'baixo', descricao: 'Pode indicar atribuição ou manipulação de atributos' }
        };

        Object.freeze(this);

        this._log('Biblioteca de validação de formulário inicializada', 'info');
    }

    /**
     * Valida texto de campo
     */
    validarCampo(texto) {

        const inicio = Date.now();

        if (texto === null || texto === undefined) {
            return {
                valido: false,
                motivo: 'Campo vazio ou indefinido',
                problemas: [],
                riscoGeral: 'erro'
            };
        }

        texto = String(texto);

        const problemas = [];

        /**
         * Detecta caracteres proibidos
         */
        for (let i = 0; i < texto.length; i++) {

            const char = texto[i];

            if (this.caracteresProibidos[char]) {

                const info = this.caracteresProibidos[char];

                problemas.push({
                    tipo: 'caractere_proibido',
                    valor: char,
                    posicao: i,
                    risco: info.risco,
                    descricao: info.descricao
                });
            }
        }

        /**
         * Detecta caracteres fora da whitelist
         */
        if (!this.regexPermitidos.test(texto)) {

            const caracteresInvalidos = texto.match(/[^a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+]/g);

            if (caracteresInvalidos) {

                caracteresInvalidos.forEach(c => {

                    problemas.push({
                        tipo: 'caractere_nao_permitido',
                        valor: c,
                        risco: 'medio',
                        descricao: 'Caractere não permitido pelo padrão de formulário'
                    });

                });

            }

        }

        const valido = problemas.length === 0;
        const riscoGeral = this._calcularRisco(problemas);
        const tempo = Date.now() - inicio;

        const resultado = {
            valido,
            riscoGeral,
            problemas,
            tempoValidacao: tempo
        };

        this._logResultado(resultado, texto);

        return resultado;
    }

    /**
     * Sanitiza texto removendo caracteres proibidos
     */
    sanitizarCampo(texto) {

        if (!texto) return '';

        const sanitizado = texto.replaceAll(/[^a-zA-ZÀ-ÿ0-9\s,.!?:\-()/@#&+]/g, '');

        this._log(`Texto sanitizado: "${texto}" -> "${sanitizado}"`, 'warn');

        return sanitizado;
    }

    /**
     * Bloqueio em input HTML
     */
    aplicarBloqueioInput(inputElement) {

        if (!inputElement) return;

        inputElement.addEventListener('input', (event) => {

            const valorOriginal = event.target.value;

            const valorFiltrado = this.sanitizarCampo(valorOriginal);

            if (valorOriginal !== valorFiltrado) {
                event.target.value = valorFiltrado;
            }

        });

        this._log('Bloqueio aplicado ao input', 'info');

    }

    /**
     * Validação em lote
     */
    validarLote(campos) {

        const inicio = Date.now();

        const resultados = campos.map(c => this.validarCampo(c));

        const validos = resultados.filter(r => r.valido).length;
        const invalidos = resultados.length - validos;

        const tempo = Date.now() - inicio;

        this._log(`Validação em lote concluída: ${validos} válidos, ${invalidos} inválidos`, 'info');

        return {
            resultados,
            resumo: {
                total: campos.length,
                validos,
                invalidos,
                tempoTotal: tempo
            }
        };
    }

    /**
     * Calcula risco geral
     */
    _calcularRisco(problemas) {

        if (problemas.length === 0) return 'nenhum';

        const ordem = ['critico', 'alto', 'medio', 'baixo'];

        for (let nivel of ordem) {
            if (problemas.some(p => p.risco === nivel)) {
                return nivel;
            }
        }

        return 'baixo';
    }

    /**
     * Log resultado
     */
    _logResultado(resultado, texto) {

        if (resultado.valido) {

            this._log(`Campo válido: "${texto}"`, 'success');

        } else {

            this._log(`Campo rejeitado - Risco ${resultado.riscoGeral.toUpperCase()}`, 'error');

            resultado.problemas.forEach((p, i) => {

                this._log(`${i + 1}. "${p.valor}" pos:${p.posicao} - ${p.descricao}`, 'warn');

            });

        }

    }

    /**
     * Sistema de log
     */
    _log(mensagem, tipo = 'info') {

        if (!this.config.logVerbose && tipo === 'info') return;

        const timestamp = new Date().toLocaleTimeString();
        const prefix = this.config.logPrefix;

        if (this.config.logColors && typeof globalThis !== 'undefined') {

            const cores = {
                info: 'color:#2196F3',
                success: 'color:#4CAF50;font-weight:bold',
                warn: 'color:#FF9800',
                error: 'color:#F44336;font-weight:bold'
            };
            
            console.info(`%c${prefix} [${timestamp}] ${mensagem}`, cores[tipo]);

        } else {
            console.info(`${prefix} [${timestamp}] ${mensagem}`);
        }

    }

}

if (typeof module !== 'undefined' && module.exports) {

    module.exports = BibliotecaValidacaoFormulario;

} else if (typeof globalThis !== 'undefined') {

    globalThis.BibliotecaValidacaoFormulario = BibliotecaValidacaoFormulario;

}