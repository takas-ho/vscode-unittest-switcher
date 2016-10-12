import * as assert from 'assert';

import * as vscode from 'vscode';
import * as toggle from '../src/ToggleFileFinder';
import * as control from '../src/FinderController';

class FakeBehavior implements toggle.ToggleFileFinderBehavior {
    findFiles(include: string, exclude: string): Thenable<vscode.Uri[]> {
        return null;
    }
    showWarningMessage(message: string, ...items: string[]) {
    }
}
suite('Extension Tests', () => {

    let behavior: toggle.ToggleFileFinderBehavior;
    let finder: toggle.ToggleFileFinder;
    let sut: control.FinderController;

    setup(() => {
        behavior = new FakeBehavior();
        finder = new toggle.ToggleFileFinder(behavior);
        sut = new control.FinderController(finder);
    });

    suite('extractSearchExclude Tests', () => {

        test('only true', () => {
            assert.deepEqual(sut.extractSearchExclude({ 'abc': true }), ['abc']);
        });

        test('only true', () => {
            assert.deepEqual(sut.extractSearchExclude({ 'a': true, 'b' : false, 'c' : true }), ['a', 'c']);
        });

    });
});