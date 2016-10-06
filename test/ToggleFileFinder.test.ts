import * as assert from 'assert';

 import * as vscode from 'vscode';
import * as ToggleFileFinder from '../src/ToggleFileFinder';

class FakeBehavior implements ToggleFileFinder.ToggleFileFinderBehavior {
    findFiles(include: string, exclude: string): Thenable<vscode.Uri[]> {
        return null;
    }
    showWarningMessage(message: string, ...items: string[]) {
    }
}
suite('Extension Tests', () => {

    let behavior: ToggleFileFinder.ToggleFileFinderBehavior;
    let sut: ToggleFileFinder.ToggleFileFinder;

    beforeEach(() => {
        behavior = new FakeBehavior();
        sut = new ToggleFileFinder.ToggleFileFinder(null, null, null, behavior);
    });

    test('Something 1', () => {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
});