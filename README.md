# Projeto: Vitality

## Descrição do Problema
No contexto das atuais rotinas contemporâneas, observa-se a negligência frequente de hábitos focados na saúde, como por exemplo a hidratação diária e a realização de atividades direcionadas a autocuidado. A ausência de um reforço positivo imediato constitui um obstáculo para a disciplina no auto-cuidado, visando os atuais vícios em dopamina causados pela rotina contemporânea.

## Solução Proposta
Desenvolvimento de uma aplicação web estruturada com recursos de gamificação para incentivar a hidratação e hábitos positivos. O sistema utiliza estímulos audiovisuais gameficados a cada tarefa concluída, visando acionar os mecanismos de recompensa neurológica do usuário. Atingir 100% de conclusão na rotina diária desencadeia um evento visual de recompensa final.

## Público-Alvo
Estudantes e profissionais cujas atividades diárias exigem o uso contínuo de computadores e que buscam uma ferramenta agradável para o gerenciamento de hábitos relacionados a saúde.

## Funcionalidades Principais
* **Gerenciamento de Tarefas:** Adição, edição em linha, marcação de conclusão e exclusão de itens de rotina.
* **Feedback Audiovisual:** Retorno sonoro e visual para confirmação de tarefas concluídas e alcance de metas diárias.
* **Monitoramento de Progresso:** Indicador visual de conclusão, estruturado atravéz de barras de progresso como as de softwares de entretenimento.
* **Notificações de Hidratação:** Sistema de lembretes configurável com até três horários distintos, integrado aos alertas do sistema operacional.
* **Redefinição Automática:** Limpeza e restauração automática do progresso diário às 03:00 (horário local).
* **Interface:** Suporte nativo aos temas claro e escuro.

## Tecnologias Utilizadas
* HTML5 (Semântica)
* CSS3 (Variáveis, Animações, Flexbox)
* JavaScript (LocalStorage API, Web Audio API, Notification API)
* Phosphor Icons (Iconografia vetorial)

## Instruções de Instalação
O sistema opera nativamente sem a necessidade de gerenciadores de pacotes ou configuração de servidores locais.
1. Crie um diretório para o projeto.
2. Aloque os arquivos `index.html`, `style.css` e `script.js` no mesmo diretório.


## Instruções de Execução
1. Navegue até o diretório do projeto.
2. Execute o arquivo `index.html` em um navegador web atualizado.
3. Abra o arquivo `index.html` utilizando seu navegador, ou clique com o botão direito em cima do arquivo, copie o caminho do arquivo (Copy path) e cole no navegador.
4. *Observação:* A funcionalidade de alertas exige a concessão de permissão para envio de notificações no prompt inicial do navegador.

## Instruções de Teste
A aplicação não engloba testes automatizados nesta versão. A validação manual deve ser realizada conforme os passos abaixo:
* Insira e conclua tarefas para verificar a execução do sistema de áudio (assegure-se de que o hardware de som está habilitado).
* Configure as notificações para o minuto seguinte ao horário de teste e observe a recepção do alerta pelo sistema operacional.

## Avaliação de Qualidade de Código (Lint)
Para a verificação estática do código, recomenda-se a utilização do ESLint via Node.js.
1. Execute a instalação global: `npm install eslint -g`.
2. No diretório do projeto, execute: `eslint script.js` (é necessária a existência prévia do arquivo de configuração `.eslintrc`).

## Versão
3

## Autoria
Carlos Adrian


## Detalhes técnicos

1. Gestão de Estado e Persistência:
O software não utiliza um banco de dados backend ou criação de contas, atendendo ao requisito de simplicidade e anonimato. Toda a persistência de dados (tarefas, tema, configurações de notificação e timestamp do último reset) é gerenciada pela API Web Storage (LocalStorage) nativa do navegador. Isso garante que os dados permaneçam salvos entre múltiplos acessos na mesma máquina.

2. Sintetização de Áudio (Web Audio API):
Para garantir que a aplicação seja leve (evitando o download de arquivos pesados de áudio) e completamente autocontida, os efeitos sonoros de gamificação são gerados matematicamente através da Web Audio API. O código cria osciladores com ondas do tipo "square" e "sawtooth" em frequências específicas para simular sons comuns de jogos.

3. Lógica de Reset às 3:00 AM:
A aplicação salva um timestamp (milissegundos) da última vez que as tarefas foram resetadas. Ao abrir o aplicativo, o JavaScript calcula se o horário atual ultrapassou as 03:00 AM do dia vigente (ou do dia seguinte, dependendo do último acesso). Se sim, ele varre a array de tarefas, altera o status `completed` para `false` e atualiza a interface visualmente.

4. Notificações do Sistema:
Utilizamos a Notification API nativa do navegador para enviar os lembretes de hidratação. O usuário cadastra três horários (em campos HTML do tipo `time`). Um `setInterval` roda a cada 60 segundos comparando a hora do sistema com os horários definidos pelo usuário.