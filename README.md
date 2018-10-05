# auth README

- Função: Enviar requisições para as APIs de autenticação da CEDRO, tanto para a de DEV quanto para a de QA, e preencher automaticamente o cookie com o token de acesso.

- Motivo: Evitar ter que enviar a requisição pelo postman e ter que escrever o cookie com o token toda hora no arquivo app.module.ts

## Features
Comandos:
- requireqatoken -> Envia a requisição para api de autenticação em QA, recupera o token e escreve o cookie no app.module.ts
- requiredevtoken -> Envia a requisição para api de autenticação em DEV, recupera o token e escreve o cookie no app.module.ts

Como chamar o comando? Digite:
- CTRL + SHIFT + P
- escreva o comando requireqatoken ou requiredevtoken
- ENTER

Depois que o comando estiver registrado, só precisa apertar CTRL + SHIFT + P e depois ENTER
## Requirements

Preencher o arquivo "/out/launchsettings.json" dentro da pasta da extensão, com os atributos necessários.
- qa_endpoint -> preencher com o endpoint de QA (omitido na extensão por razões de segurança)
- dev_endpoint -> preencher com o endpoint de DEV (omitido na extensão por razões de segurança)
- login -> preencher com o endpoint de QA (omitido na extensão por razões de segurança)
- password -> preencher com o endpoint de QA (omitido na extensão por razões de segurança)

Necessário estar utilizando a versão 1.19.1 ou superior do VS CODE.

## Known Issues

- O código está longe de ser perfeito ou bonito. Fiz nas horas vagas da maneira mais rápida possível pois não tinha muito tempo livre, e não aguentava mais ter que abrir o postman e escrever o bendito cookie.
- A extensão não pega o "path" do app.module.ts se não houver um arquivo aberto, e o arquivo aberto precisa estar localizado dentro da pasta "/src/app".
- Se seu app.module.ts não tiver a seguinte linha de código "if (!cookieService.check", não vai funcionar a extensão.
- Não há tratamento de exceção caso o usuário não configure o launchsettings.json corretamente.

## Release Notes

- Refatoração do  código.
- Tratamento de exceções
- Atualização do readme.md

### 0.0.5
- Versão experimental. Sugestões e críticas são bem vindas.