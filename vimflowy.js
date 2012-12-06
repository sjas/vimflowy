// TODO: support search functionality -- '/', type query, esc, n/N move you
// between search terms?
// TODO: add 'e', 'dd', others?
//

var normalKeybindings = {
    "j": commands.moveDown,
    "k": commands.moveUp,
    "h": commands.moveLeft,
    "l": commands.moveRight,

    "w": commands.moveWordForward,
    "b": commands.moveWordBackward,

    "x": commands.doBackspace,

    "shift+o": commands.createNewBefore,
    "o": commands.createNewAfter,

    "shift+i": commands.insertBeginning,
    "shift+a": commands.insertEnd,

    "u": commands.doUndo,
    "ctrl+r": commands.doRedo,

    "i": enterInsertMode,
    "a": enterInsertMode
};

var insertKeybindings = {
    "esc": enterNormalMode,

    // TODO: this breaks tab closing (even more)!
    "ctrl+w": commands.deleteWordBack,
    "ctrl+u": commands.deleteItemBack
};

var alwaysKeybindings = {
    "alt+l": commands.zoomInFold,
    "alt+h": commands.zoomOutFold,

    "alt+shift+l": commands.doIndent,
    "alt+shift+h": commands.doDedent,

    "alt+shift+k": commands.doProjectUp,
    "alt+shift+j": commands.doProjectDown
};

// unbind and rebind so we can get esc key back
$(".editor > textarea").unbind("keydown");
$(".editor > textarea").addTextAreaEventHandlers();

// add some "vimflowy" movement keybindings
$(".editor > textarea").addModalKeyboardShortcuts(alwaysKeybindings);

var blockAll = function (e) { e.preventDefault(); }

function enterNormalMode () {
    console.log('entering normal mode');
    $(".editor > textarea").bind("keydown", blockAll);
    $(".editor > textarea").addModalKeyboardShortcuts(normalKeybindings, insertKeybindings);
};

function enterInsertMode (e) {
    e.preventDefault();
    console.log('entering insert mode');
    $(".editor > textarea").unbind("keydown", blockAll);
    $(".editor > textarea").addModalKeyboardShortcuts(insertKeybindings, normalKeybindings);
}

// start 'er up
enterNormalMode();
