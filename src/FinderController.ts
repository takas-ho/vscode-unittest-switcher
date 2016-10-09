'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as toggle from './ToggleFileFinder';

export class FinderController {

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
