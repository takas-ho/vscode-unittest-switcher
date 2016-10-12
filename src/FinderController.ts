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
        this.readFilesIfChangedEditor(editor);
    }

    public readFilesIfChangedEditor(editor: vscode.TextEditor) {
        let editorFileName: string = editor.document.fileName;
        if (editorFileName === this.finder.currentFileOfToggle()) {
            return;
        }
        let searchExclude = vscode.workspace.getConfiguration('search').get('exclude');
        let unittestSuffixes: string[] = vscode.workspace.getConfiguration('unittest-switcher')
            .get<string[]>('unittest.suffix', ['Spec', '-spec', 'Test', '-test', '.test']);
        this.finder.readFilesBy(editorFileName, unittestSuffixes, this.extractSearchExclude(searchExclude));
    }

    public extractSearchExclude(searchExclude): string[] {
        let excludes: string[] = Object.keys(searchExclude);
        excludes = excludes.filter(value => { return searchExclude[value]; });
        return excludes;
    }
}
