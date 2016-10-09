'use strict';

import * as vscode from 'vscode';
let path = require('path');

export interface ToggleFileFinderBehavior {
    findFiles(include: string, exclude: string): Thenable<vscode.Uri[]>;
    showWarningMessage(message: string, ...items: string[]);
}
class DefaultToggleFileFinderBehavior implements ToggleFileFinderBehavior {
    findFiles(include: string, exclude: string): Thenable<vscode.Uri[]> {
        return vscode.workspace.findFiles(include, exclude, 100);
    }
    showWarningMessage(message: string, ...items: string[]) {
        vscode.window.showWarningMessage(message, ...items);
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

    public constructor(behavior?: ToggleFileFinderBehavior) {
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
            if (!uris) {
                return;
            }
            uris.forEach(uri => {
                self.matchingFiles.push(uri.path);
            });
            self.matchingFiles.sort();
            self.currentIndex = self.matchingFiles.indexOf(self.editorFileName);
            self.outputMatchingFiles();
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

    public isFirstTime() {
        return !this.matchingFiles;
    }

    public hasNext() {
        return this.matchingFiles && 1 < this.matchingFiles.length;
    }

    private callNext() {
        if (!this.hasNext()) {
            this.behavior.showWarningMessage('Not found match files...');
            return;
        }
        this.currentIndex = (this.currentIndex + 1) % this.matchingFiles.length;
        this.callback(this.matchingFiles[this.currentIndex]);
    }

    public readFilesBy(editorFileName: string, fileSuffixes: string[], excludePatterns: string[]) {
        this.editorFileName = editorFileName;
        this.fileSuffixes = fileSuffixes;
        this.excludePattern = this.resolveExcludePatterns(excludePatterns);
        this.readFiles();
    }

    private resolveExcludePatterns(excludePatterns: string[]): string {
        return '{' + excludePatterns.join(',') + '}';
    }

    public currentFileOfToggle(): string {
        return this.isFirstTime() ? null : this.matchingFiles[this.currentIndex];
    }

    public outputMatchingFiles() {
        if (!this.matchingFiles) {
            console.log('null');
            return;
        }
        else if (this.matchingFiles.length === 0) {
            console.log('[]');
            return;
        }
        console.log(this.matchingFiles.join('\n'));
    }
}