'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_1 = require("vscode");
const request = require("request");
const settings = require("../out/launchsettings.json");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    var svc = new RequestService();
    let disposable = vscode_1.commands.registerCommand('extension.getQaToken', () => {
        svc.getAuthorizationToken(false);
    });
    let dispose = vscode_1.commands.registerCommand('extension.getDevToken', () => {
        svc.getAuthorizationToken(true);
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(dispose);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
class RequestService {
    getAuthorizationToken(isDev) {
        var self = this;
        let editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            vscode_1.window.showErrorMessage("ERRO: Para funcionar a extensão, abra qualquer documento dentro da pasta src/app/");
            return;
        }
        let doc = editor.document;
        var showErrorMessage = function (response) {
            vscode_1.window.showInformationMessage(response.error);
            vscode_1.window.showInformationMessage(response.error_description);
        };
        var showSuccessMessage = function (response) {
            var requestReponse = "expires_in: " + Math.round(Number(response.expires_in) / 60) + " minutes";
            vscode_1.window.showInformationMessage(requestReponse);
            vscode_1.window.showInformationMessage(response.access_token);
        };
        var writeAuthorizationCookie = function (response) {
            var fs = require("fs");
            var index = doc.fileName.indexOf("\app");
            if (index == -1) {
                vscode_1.window.showErrorMessage("ERRO: Para funcionar a extensão, abra qualquer documento dentro da pasta src/app/");
                return;
            }
            var appModulePath = doc.fileName.slice(0, index) + "app\\app.module.ts";
            var content = fs.readFileSync(appModulePath, 'utf8');
            var newAuth = self.getNewAuthorization(content, response.access_token);
            fs.writeFile(appModulePath, newAuth, function () { });
            showSuccessMessage(response);
        };
        var definePostParametersForQa = function () {
            return {
                method: "POST",
                uri: settings.qa_endpoint,
                body: JSON.stringify({
                    "user_name": settings.login,
                    "password": settings.password
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        };
        var definePostParametersForDev = function () {
            return {
                method: "POST",
                uri: settings.dev_endpoint,
                body: JSON.stringify({
                    "user_name": settings.login,
                    "password": settings.password
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        };
        var showPostFeedback = function (body) {
            let response = JSON.parse(body);
            if (response.error) {
                showErrorMessage(response);
            }
            else {
                writeAuthorizationCookie(response);
            }
        };
        if (isDev) {
            vscode_1.window.showInformationMessage("Requisição DEV");
            request.post(definePostParametersForDev(), function (err, httpResponse, body) {
                showPostFeedback(body);
            });
        }
        else {
            vscode_1.window.showInformationMessage("Requisição QA");
            request.post(definePostParametersForQa(), function (err, httpResponse, body) {
                showPostFeedback(body);
            });
        }
    }
    getNewAuthorization(docContent, accessToken) {
        var hasPayload = true;
        var payload = "";
        var newAuth = "";
        var startIndex = docContent.indexOf("const obj = {");
        var endIndex = docContent.indexOf('const objStr');
        var end = endIndex - startIndex;
        if (this.hasTemplate(startIndex, endIndex)) {
            payload = docContent.substr(startIndex, end);
            var parsedPayload = this.getJsonObj(payload);
            parsedPayload.acess_token = accessToken;
            newAuth = this.generateNewAuthorization(docContent, parsedPayload, startIndex, endIndex, hasPayload);
        }
        else {
            endIndex = docContent.indexOf("if (!cookieService");
            startIndex = endIndex - 1;
            end = endIndex;
            hasPayload = false;
            payload = this.getCookieTemplate();
            payload = payload.replace(`""`, `"${accessToken}"`);
            newAuth = this.generateNewAuthorization(docContent, payload, startIndex, endIndex, hasPayload);
        }
        return newAuth;
    }
    hasTemplate(startIndex, endIndex) {
        return startIndex != -1 && endIndex != -1;
    }
    generateNewAuthorization(textInDocument, parsedPayload, startIndex, endIndex, hasPayload) {
        var fisrtPortionOfText = textInDocument.slice(0, startIndex);
        var secondPortionOfText = textInDocument.slice(endIndex, textInDocument.length);
        var newTextToWrite = "";
        if (hasPayload) {
            newTextToWrite = fisrtPortionOfText + "const obj = " + JSON.stringify(parsedPayload) + ";" + secondPortionOfText;
        }
        else {
            newTextToWrite = fisrtPortionOfText + parsedPayload + secondPortionOfText;
        }
        return newTextToWrite;
    }
    getJsonObj(stringJson) {
        stringJson = stringJson.replace("const obj = {", "{").replace(";", "");
        var teste = stringJson.replace(/'/g, '"');
        var parsedJsonString = JSON.parse(teste);
        return parsedJsonString;
    }
    getCookieTemplate() {
        return `
        const obj = {"acess_token":""};
        const objStr = JSON.stringify(obj);
        cookieService.delete('authInfo', '/');
        cookieService.set('authInfo', objStr, null, '/');

        `;
    }
}
//# sourceMappingURL=extension.js.map