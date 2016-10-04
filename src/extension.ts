'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as toggle from './ToggleFileFinder';

// let finder: toggle.ToggleFileFinder;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "unittest-switcher" is now active!');

    let finder = new toggle.ToggleFileFinder(vscode.window.activeTextEditor.document.fileName,
        ['Spec', 'Test', '.test'], '**/node_modules/**');
    let controller = new FinderController(finder);
    finder.callback = name => {
        vscode.workspace.openTextDocument(name).then(doc => {
            vscode.window.showTextDocument(doc).then(editor => {

            }, err => {
                console.error(err);
            });
        }, err => {
            console.error(err);
        });
    };

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.toggleUnitTests', () => {
        // The code you place here will be executed every time your command is executed
        finder.changeToNext();
    });

    context.subscriptions.push(controller);
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class FinderController {

    private finder: toggle.ToggleFileFinder;
    private _disposable: vscode.Disposable;

    constructor(finder: toggle.ToggleFileFinder) {
        this.finder = finder;

        // subscribe to selection change and editor activation events
        let subscriptions: vscode.Disposable[] = [];
        // vscode.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        // create a combined disposable from both event subscriptions
        this._disposable = vscode.Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onEvent(editor: vscode.TextEditor) {
        this.finder._onEvent(editor);
    }
}
