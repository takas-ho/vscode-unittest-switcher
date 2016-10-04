'use strict';

import * as vscode from 'vscode';
let path = require('path');

export interface ToggleFileFinderBehavior {
    findFiles(include: string, exclude: string): Thenable<vscode.Uri[]>;
}
class DefaultToggleFileFinderBehavior implements ToggleFileFinderBehavior {
    findFiles(include: string, exclude: string): Thenable<vscode.Uri[]> {
        return vscode.workspace.findFiles(include, exclude, 100);
    }
}
export class ToggleFileFinder {

    private editorFileName: string;
    private fileSuffixes: string[];
    private excludePattern: string;
    private behavior: ToggleFileFinderBehavior;
    private currentIndex: number;
    private matchingFiles: string[];
    public callback: (name: string) => void;

    public constructor(editorFileName: string, fileSuffixes: string[], excludePattern: string,
                        behavior?: ToggleFileFinderBehavior) {
        this.editorFileName = editorFileName;
        this.fileSuffixes = fileSuffixes;
        this.excludePattern = excludePattern;
        this.behavior = behavior ? behavior : new DefaultToggleFileFinderBehavior;
        this.currentIndex = -1;
    }

    public readFiles(callsNext?: boolean) {
        console.log('readFiles');
        let name: string = path.parse(this.editorFileName).name;
        let ext: string = path.parse(this.editorFileName).ext;
        let unitTestBase: string = name;
        this.fileSuffixes.some(suffix => {
            if (name.endsWith(suffix)) {
                unitTestBase = name.substring(0, name.length - suffix.length);
                return true;
            }
        });

        this.matchingFiles = [];
        let self = this;
        this.behavior.findFiles('**/' + unitTestBase + '{,' + this.fileSuffixes.join(',') + '}' + ext, self.excludePattern).then(uris => {
            uris.forEach(uri => {
                self.matchingFiles.push(uri.path);
            });
            self.matchingFiles.sort();
            self.currentIndex = self.matchingFiles.indexOf(self.editorFileName);
            if (callsNext) {
                self.callNext();
            }
        });
    }

    public changeToNext() {
        if (this.currentIndex < 0) {
            this.readFiles(true);
        } else {
            this.callNext();
        }
    }

    private callNext() {
        this.currentIndex = (this.currentIndex + 1) % this.matchingFiles.length;
        this.callback( this.matchingFiles[this.currentIndex]);
    }

    public _onEvent(editor: vscode.TextEditor) {
        if (editor.document.fileName === this.matchingFiles[this.currentIndex]) {
            return;
        }
        this.editorFileName = editor.document.fileName;
        this.readFiles();
    }
}