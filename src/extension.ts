'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as toggle from './ToggleFileFinder';
import * as control from './FinderController';

// let finder: toggle.ToggleFileFinder;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "unittest-switcher" is now active!');

    let searchExclude = vscode.workspace.getConfiguration('search').get('exclude');
    let excludes: string[] = Object.keys(searchExclude);
    let unittestSuffixes: string[] = vscode.workspace.getConfiguration('unittest-switcher')
        .get<string[]>('unittest.suffix', ['Spec', '-spec', 'Test', '-test', '.test']);
    let finder = new toggle.ToggleFileFinder(vscode.window.activeTextEditor.document.fileName,
        unittestSuffixes, excludes);
    let controller = new control.FinderController(finder);
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
    let disposable = vscode.commands.registerCommand('unittest-switcher.go-to-test-code', () => {
        // The code you place here will be executed every time your command is executed
        finder.changeToNext();
    });

    context.subscriptions.push(controller);
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
