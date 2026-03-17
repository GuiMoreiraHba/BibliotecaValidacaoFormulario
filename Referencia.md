Caracters conhecidos que causam problemas na importação de planilha no online:

_ (Underline)
; (Ponto e Virgula)
\ (Contra Barra)
| (Pipe)

Validações Formulário de inscrição
	Criação e edição do formulário
	- Nome campo BR (Todos os campos do formulário)
	- Nome campo EN (Todos os campos do formulário)
	- Nome campo ES (Todos os campos do formulário)
	
	Tipo Campo:
	- Lista (Nome Opções)
	- Multipla Escolha (Nome Opções)
	- Varios Valores (Nome Opções)
	- Termo (Textarea, existe um texto informando que não pode conter underline)
	
	
Será necessario validar todos os campos adicionais.

Validação de opções para campos dos tipos:
	- Lista (Nome Opções)
	- Multipla Escolha (Nome Opções)
	- Varios Valores (Nome Opções)
	- Termo (Textarea, existe um texto informando que não pode conter underline)
	
Durante a criação e edição desses campos exceto o termo os campos de tipo lista, multipla escolha e varios valores
permite tanto a importação de uma planilha quando a digitação manual do nome das opções. Tanto a digitação quanto importação 
devem garantir que esses caracteres não permitidos sejam digitados em caso de digitação do nome. Em caso de importação para não
barrar a lista de ser importada, será necessario remover esses caracteres no momento do processamento da lista, visto que o usuário
poderá em algum momento enviar uma lista não de acordo com os padrões.

	
Cadastro de Categoria:
- Nome da categoria

Cadastro da Atividade
- O nome da atividade já é tratado para evitar o erro

