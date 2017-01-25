import * as assert from 'assert';

import * as vscode from 'vscode';
import * as ToggleFileFinder from '../src/ToggleFileFinder';

class FakeBehavior implements ToggleFileFinder.ToggleFileFinderBehavior {
    public files: string[];
    findFiles(include: string, exclude: string): Thenable<vscode.Uri[]> {
        let regex = new RegExp(this.ConvGlobToRegExpStr(include));
        let regexExclude = new RegExp(this.ConvGlobToRegExpStr(exclude));
        let files2: string[] = this.files ? this.files.filter(value => { return regex.test(value) && !regexExclude.test(value); }) : [];
        let uris: vscode.Uri[] = files2.map(value => { return vscode.Uri.file(value); });
        return  Promise.resolve<vscode.Uri[]>(uris);
    }
    private ConvGlobToRegExpStr(globPattern: string): string {
        return globPattern ? globPattern.replace('**/', '/').replace(/\./g, '\\.').replace(/,/g, '|').replace('{', '(').replace('}', ')?') : null;
    }
    showWarningMessage(message: string, ...items: string[]) {
    }
}
let path = require('path');
function resolve(filepath: string) {
    return filepath.replace(/\//g, path.sep);
}
suite('ToggleFileFinder Tests', () => {

    let behavior: FakeBehavior;
    let sut: ToggleFileFinder.ToggleFileFinder;

    setup(() => {
        behavior = new FakeBehavior();
        sut = new ToggleFileFinder.ToggleFileFinder(behavior);
    });

    suite('readFilesBy test', () => {

        setup(() => {
            behavior.files = ['/src/foo.js', '/test/fooSpec.js', '/test/fooTest.js', '/src/bar.ts', '/test/bar.test.ts', '/test/barSpec.ts'];
        });

        test('match the suffix ... code to Spec', () => {
            return sut.readFilesBy(resolve('/src/foo.js'), ['Spec'], null).then(() => {
                assert(sut.matchingFiles);
                assert.equal(sut.matchingFiles[0], resolve('/src/foo.js'));
                assert.equal(sut.matchingFiles[1], resolve('/test/fooSpec.js'));
                assert.equal(sut.matchingFiles.length, 2);
                assert.equal(sut.currentFileOfToggle(), resolve('/src/foo.js'));
            });
        });

        test('match the suffix ... code to Test', () => {
            return sut.readFilesBy(resolve('/src/foo.js'), ['Test'], null).then(() => {
                assert(sut.matchingFiles);
                assert.equal(sut.matchingFiles[0], resolve('/src/foo.js'));
                assert.equal(sut.matchingFiles[1], resolve('/test/fooTest.js'));
                assert.equal(sut.matchingFiles.length, 2);
                assert.equal(sut.currentFileOfToggle(), resolve('/src/foo.js'));
            });
        });

        test('match the suffix ... code to Test&Spec', () => {
            return sut.readFilesBy(resolve('/src/foo.js'), ['Spec', 'Test'], null).then(() => {
                assert(sut.matchingFiles);
                assert.equal(sut.matchingFiles[0], resolve('/src/foo.js'));
                assert.equal(sut.matchingFiles[1], resolve('/test/fooSpec.js'));
                assert.equal(sut.matchingFiles[2], resolve('/test/fooTest.js'));
                assert.equal(sut.matchingFiles.length, 3);
                assert.equal(sut.currentFileOfToggle(), resolve('/src/foo.js'));
            });
        });

        test('match the suffix ... Spec to code', () => {
            return sut.readFilesBy(resolve('/test/fooSpec.js'), ['Spec'], null).then(() => {
                assert(sut.matchingFiles);
                assert.equal(sut.matchingFiles[0], resolve('/src/foo.js'));
                assert.equal(sut.matchingFiles[1], resolve('/test/fooSpec.js'));
                assert.equal(sut.matchingFiles.length, 2);
                assert.equal(sut.currentFileOfToggle(), resolve('/test/fooSpec.js'));
            });
        });

    });

    suite('readFilesBy test for multi period', () => {

        setup(() => {
            behavior.files = ['/src/foo.service.ts', '/test/foo.service.spec.ts', '/test/foo.spec.ts', '/src/foo.bar.ts'];
        });

        test('match the suffix ... code to `.spec`', () => {
            return sut.readFilesBy(resolve('/src/foo.service.ts'), ['.spec'], null).then(() => {
                assert(sut.matchingFiles);
                assert.equal(sut.matchingFiles[0], resolve('/src/foo.service.ts'));
                assert.equal(sut.matchingFiles[1], resolve('/test/foo.service.spec.ts'));
                assert.equal(sut.matchingFiles.length, 2);
                assert.equal(sut.currentFileOfToggle(), resolve('/src/foo.service.ts'));
            });
        });

    });

});