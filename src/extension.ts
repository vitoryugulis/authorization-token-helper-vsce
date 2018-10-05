'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, commands, ExtensionContext, TextDocument } from 'vscode';
import * as request from 'request';
import * as settings from '../out/launchsettings.json';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

    var svc = new RequestService();

    let disposable = commands.registerCommand('extension.getQaToken', () => {
        svc.getAuthorizationToken(false);
    });
    let dispose = commands.registerCommand('extension.getDevToken', () => {
        svc.getAuthorizationToken(true);
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(dispose);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class RequestService {

     getAuthorizationToken(isDev: boolean) {
        let editor = window.activeTextEditor;
        if(!editor){
            window.showErrorMessage("ERRO: Para funcionar a extensão, abra qualquer documento dentro da pasta src/app/");
            return;
        }
        let doc = editor.document;
        this.start(isDev, doc);
    }

    start(isDev: boolean, doc: TextDocument){
        let self = this;
        if(isDev){
            window.showInformationMessage("Requisição DEV");
            request.post(this.definePostParameters(isDev), function (err, httpResponse, body) {
                self.showPostFeedback(body, doc);
            });
        }
        else{
            window.showInformationMessage("Requisição QA");
            request.post(this.definePostParameters(isDev), function (err, httpResponse, body) {
                self.showPostFeedback(body, doc);
            });
        }
    }
    
    showPostFeedback(body: any, doc: TextDocument) {
        let response = JSON.parse(body);
        if (response.error) {
            this.showErrorMessage(response);
        }
        else {
            this.writeAuthorizationCookie(response, doc);
        }
    }

    showErrorMessage(response: any) {
        window.showInformationMessage(response.error);
        window.showInformationMessage(response.error_description);
    }

    writeAuthorizationCookie(response: any, doc: TextDocument){
        let self = this;
        var fs = require("fs");
        var index = doc.fileName.indexOf("\app");
        if(index == -1){
            window.showErrorMessage("ERRO: Para funcionar a extensão, abra qualquer documento dentro da pasta src/app/");
            return;
        }
        var appModulePath = doc.fileName.slice(0, index) + "app\\app.module.ts";
        var content = fs.readFileSync(appModulePath, 'utf8');
        var newAuth = self.getNewAuthorization(content, response.access_token);
        fs.writeFile(appModulePath, newAuth, function () { });
        self.showSuccessMessage(response);
    }

    showSuccessMessage(response: any){
        var requestReponse = "expires_in: " + Math.round(Number(response.expires_in) / 60) + " minutes";
        window.showInformationMessage(requestReponse);
        window.showInformationMessage(response.access_token);
    }

     getNewAuthorization(docContent: string, accessToken: string) {
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

    hasTemplate(startIndex: number, endIndex: number) {
        return startIndex != -1 && endIndex != -1;
    }

    definePostParameters(isDev: boolean) {
        return {
            method: "POST",
            uri: isDev? settings.dev_endpoint: settings.qa_endpoint,
            body: JSON.stringify({
                "user_name": settings.login,
                "password": settings.password
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }

    generateNewAuthorization(textInDocument: string, parsedPayload: JSON | string, startIndex: number, endIndex: number, hasPayload: boolean) {
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

    getJsonObj(stringJson: string) {
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