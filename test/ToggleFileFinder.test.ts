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
            return sut.readFilesBy('/src/foo.js', ['Spec'], null).then(() => {
                assert(sut.matchingFiles);
                assert.equal(sut.matchingFiles[0], '/src/foo.js');
                assert.equal(sut.matchingFiles[1], '/test/fooSpec.js');
                assert.equal(sut.matchingFiles.length, 2);
            });
        });

        test('match the suffix ... code to Test', () => {
            return sut.readFilesBy('/src/foo.js', ['Test'], null).then(() => {
                assert(sut.matchingFiles);
                assert.equal(sut.matchingFiles[0], '/src/foo.js');
                assert.equal(sut.matchingFiles[1], '/test/fooTest.js');
                assert.equal(sut.matchingFiles.length, 2);
            });
        });

        test('match the suffix ... code to Test&Spec', () => {
            return sut.readFilesBy('/src/foo.js', ['Spec', 'Test'], null).then(() => {
                assert(sut.matchingFiles);
                assert.equal(sut.matchingFiles[0], '/src/foo.js');
                assert.equal(sut.matchingFiles[1], '/test/fooSpec.js');
                assert.equal(sut.matchingFiles[2], '/test/fooTest.js');
                assert.equal(sut.matchingFiles.length, 3);
            });
        });

        test('match the suffix ... Spec to code', () => {
            return sut.readFilesBy('/src/fooSpec.js', ['Spec'], null).then(() => {
                assert(sut.matchingFiles);
                assert.equal(sut.matchingFiles[0], '/src/foo.js');
                assert.equal(sut.matchingFiles[1], '/test/fooSpec.js');
                assert.equal(sut.matchingFiles.length, 2);
            });
        });

    });

});