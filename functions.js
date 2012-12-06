// quickly bind our new keys
jQuery.fn.addModalKeyboardShortcuts = function (bindings, unbindings) {
    this.each(function () {
        for (var key in bindings) {
            if (bindings.hasOwnProperty(key)) {
                $(this).bind("keydown", key, bindings[key]);
            }
        }

        for (var key in unbindings) {
            if (unbindings.hasOwnProperty(key)) {
                $(this).unbind("keydown", unbindings[key]);
            }
        }
    });
};

// redefine workflowy's global shortcuts so we can remove esc binding
jQuery.fn.addGlobalKeyboardShortcuts = function () {
    this.each(function () {
        $(this).registerHandlerForShortcuts("s", ["ctrl", "meta"], function () {
            saveEditingContent();
            pushpoll.scheduleNextPushAndPoll(true);
            return false
        });
        $(this).registerHandlerForShortcuts("z", ["ctrl", "meta"], function () {
            undoredo.undo();
            return false
        });
        $(this).registerHandlerForShortcuts("shift+z", ["ctrl", "meta"], function () {
            undoredo.redo();
            return false
        });
        $(this).registerHandlerForShortcuts("y", ["ctrl", "meta"], function () {
            undoredo.redo();
            return false
        });
        $(this).registerHandlerForShortcuts("home", ["ctrl", "meta"], function () {
            var a = getCurrentlyFocusedEditor();
            if (!(a !== null && a.isNote())) {
                focusFirstProject();
                return false
            }
        });
        $(this).registerHandlerForShortcuts("end", ["ctrl", "meta"], function () {
            var a = getCurrentlyFocusedEditor();
            if (!(a !== null && a.isNote())) {
                focusLastProject();
                return false
            }
        });
        $(this).registerHandlerForShortcuts("shift+/", ["ctrl", "meta"], function () {
            keyboardShortcutHelper.toggle();
            return false
        });
        $(this).registerHandlerForShortcuts("/", ["ctrl", "meta"], function () {
            keyboardShortcutHelper.toggle();
            return false
        });
    });
    return this
};

// command functions
var commands = {
    deleteWordBack: function (e) {
        e.preventDefault();

        var index = indexOfNextCaret($(e.target).getCaret().start, $(e.target).val(), { backward: true, shift: true });

        var n_back = $(e.target).getCaret().start - index;

        for (var i=0; i < n_back; i++) {
            $(e.target).simulate("key-sequence", {sequence: "{backspace}", triggerKeyEvents: true });
        }
        return false;
    },

    deleteItemBack: function (e) {
        e.preventDefault();

        var n_back = $(e.target).getCaret().start;

        for (var i=0; i < n_back; i++) {
            $(e.target).simulate("key-sequence", {sequence: "{backspace}", triggerKeyEvents: true });
        }
        return false;

    },

    moveWordForward: function (e) {
        e.preventDefault();

        var index = indexOfNextCaret($(e.target).getCaret().start, $(e.target).val(), { shift: true });
        if (index > 0) {
            $(e.target).setCaret(index);
        } else {
            $(e.target).setCaret($(e.target).val().length);
            $(e.target).rightArrowHandler(); 
        }
        return false;
    },

    moveWordBackward: function (e) {
        e.preventDefault();

        var index = indexOfNextCaret($(e.target).getCaret().start, $(e.target).val(), { backward: true, shift: true });
        if (index > -1) {
            $(e.target).setCaret(index);
        } else {
            $(e.target).setCaret(0);
            $(e.target).leftArrowHandler(); 
            // TODO: after we move to the new field, go back a word again
        }

        return false;
    },

    doBackspace: function (e) {
        e.preventDefault();
        $(e.target).simulate("key-sequence", {sequence: "{backspace}", triggerKeyEvents: true });
        return false;
    },

    moveDown: function (e) {
        e.preventDefault();
        $(e.target).downArrowHandler();
        return false;
    },

    moveUp: function (e) {
        e.preventDefault();
        $(e.target).upArrowHandler();
        return false;
    },

    moveLeft: function (e) {
        e.preventDefault();
        if ($(e.target).getCaret().start === 0) {
            $(e.target).leftArrowHandler(); 
        } else {
            $(e.target).simulate("key-sequence", {sequence: "{leftarrow}", triggerKeyEvents: false });
        } 
        return false;
    },

    moveRight: function (e) {
        e.preventDefault();
        if ($(e.target).getCaret().start === $(e.target).val().length) {
            $(e.target).rightArrowHandler(); 
        } else {
            $(e.target).simulate("key-sequence", {sequence: "{rightarrow}", triggerKeyEvents: false });
        }
        return false;
    },

    doUndo: function (e) {
        undoredo.undo();
        return false;
    },

    doRedo: function (e) {
        e.preventDefault();
        undoredo.redo();
        return false;
    },

    toggleFold: function (e) {
        $(e.target).keyboardExpandToggle();
        return false;
    },

    openFold: function (e) {
        $(e.target).keyboardExpand();
        return false;
    },

    closeFold: function (e) {
        $(e.target).keyboardCollapse();
        return false;
    },

    zoomInFold: function (e) {
        $(e.target).keyboardZoomIn();
        return false;
    },

    zoomOutFold: function (e) {
        keyboardZoomOut();
        return false;
    },

    doIndent: function (e) {
        $(e.target).indentProject();
        return false;
    },

    doDedent: function (e) {
        $(e.target).dedentProject();
        return false;
    },

    createNewAfter: function (e) {
        e.preventDefault();

        // set caret to end of text
        $(e.target).setCaret($(e.target).val().length);

        // activate return
        $(e.target).returnHandler();

        // go into insert mode
        enterInsertMode(e);
        return false;
    },

    createNewBefore: function (e) {
        e.preventDefault();

        // set caret to beginning of text
        $(e.target).setCaret(0);

        // activate return
        $(e.target).returnHandler();

        // go up to the item
        $(e.target).upArrowHandler();

        // go into insert mode
        enterInsertMode(e);
        return false;
    },

    insertBeginning: function (e) {
        e.preventDefault();
        $(e.target).setCaret(0);
        enterInsertMode(e);
        return false;
    },

    insertEnd: function (e) {
        e.preventDefault();
        $(e.target).setCaret($(e.target).val().length);
        enterInsertMode(e);
        return false;
    },

    doProjectUp: function (e) {
        e.preventDefault();
        $(e.target).moveProjectUp();
        return false;
    },

    doProjectDown: function (e) {
        e.preventDefault();
        $(e.target).moveProjectDown();
        return false;
    },

    enterSearchMode: function () {
        // TODO: have esc move you back to projects
        $("#searchBox").focus();
        return false;
    }
};

// helper functions
var indicesOf = function (searchStr, str) {
    var startIndex = 0, searchStrLen = searchStr.length;
    var index, indices = [];
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
};

var indexOfNextCaret = function (currentPos, str, options) {
    // set default options
    if (typeof options === 'undefined') {
        var options = new Object();
        options.backward = false;
        options.shift = false;
    } else {
        options.backward = typeof options.backward !== 'undefined' ? options.backward : false;
        options.shift = typeof options.shift !== 'undefined' ? options.shift : false;
    }

    var index, indices = [];
    var searchStr = " ";
    if (options.backward == false) {

        index = str.indexOf(searchStr, currentPos+1);

    } else {

        if (str.charAt(currentPos-1) == ' ') { currentPos--; }

        while (((str.indexOf(searchStr, index+1)) > -1) && (str.indexOf(searchStr, index+1) < currentPos)) {
            index = str.indexOf(searchStr, index+1);
        }

        if (isNaN(index)) { index = -1; }

        if (currentPos == 0) { index = -2; }
    }

    if (options.shift == true) { index++; }

    return index;
};
