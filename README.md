# auth README

- Função: Enviar requisições para as APIs de autenticação da CEDRO, tanto para a de DEV quanto para a de QA, e preencher automaticamente o cookie com o token de acesso.

- Motivo: Evitar ter que enviar a requisição pelo postman e ter que escrever o cookie com o token toda hora no arquivo app.module.ts

## Features
Comandos:
- requireqatoken -> Envia a requisição para api de autenticação em QA, recupera o token e escreve o cookie no app.module.ts
- requiredevtoken -> Envia a requisição para api de autenticação em DEV, recupera o token e escreve o cookie no app.module.ts

## Requirements

Preencher o arquivo "/src/launchsettings.json" com os atributos necessários.
- qa_endpoint -> preencher com o endpoint de QA (omitido na extensão por razões de segurança)
- dev_endpoint -> preencher com o endpoint de DEV (omitido na extensão por razões de segurança)
- login -> preencher com o endpoint de QA (omitido na extensão por razões de segurança)
- password -> preencher com o endpoint de QA (omitido na extensão por razões de segurança)

## Known Issues

- O código está longe de ser perfeito ou bonito. Fiz nas horas vagas da maneira mais rápida possível pois não tinha muito tempo livre, e não aguentava mais ter que abrir o postman e escrever o bendito cookie.
- A extensão não pega o "path" do app.module.ts se não houver um arquivo aberto, e o arquivo aberto precisa estar localizado dentro da pasta "/src/app".

## Release Notes

Primeira versão... funcionalidades descritas acima.

### 1.0.0
- Release version.
