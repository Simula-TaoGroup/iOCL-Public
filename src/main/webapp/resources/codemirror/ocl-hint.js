// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function (mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function (CodeMirror) {
    var Pos = CodeMirror.Pos;

    function forEach(arr, f) {
        for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
    }

    function arrayContains(arr, item) {
        if (!Array.prototype.indexOf) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === item) {
                    return true;
                }
            }
            return false;
        }
        return arr.indexOf(item) != -1;
    }

    /* scriptHint */

    function scriptHint(editor, keywords, getToken, options) {
        // Find the token at the cursor
        var cur = editor.getCursor(), token = getToken(editor, cur);
        if (/\b(?:string|comment)\b/.test(token.type)) return;
        token.state = CodeMirror.innerMode(editor.getMode(), token.state).state;

        // If it's not a 'word-style' token, ignore the token.
        if (!/^[\w$_]*$/.test(token.string)) {
            token = {
                start: cur.ch, end: cur.ch, string: "", state: token.state,
                type: token.string == "." ? "property" : null
            };
        } else if (token.end > cur.ch) {
            token.end = cur.ch;
            token.string = token.string.slice(0, cur.ch - token.start);
        }

        var tprop = token;
        // If it is a property, find out what it is a property of.
        while (tprop.type == "property") {
            tprop = getToken(editor, Pos(cur.line, tprop.start));
            if (tprop.string != ".") return;
            tprop = getToken(editor, Pos(cur.line, tprop.start));
            if (!context) var context = [];
            context.push(tprop);
        }
        return {
            list: getCompletions(token, context, keywords, options),
            from: Pos(cur.line, token.start),
            to: Pos(cur.line, token.end)
        };
    }


    /* oclHintProperty */
    function oclHintProperty(editor, cur) {
        // This getToken, it is for coffeescript, imitates the behavior of
        // getTokenAt method in javascript.js, that is, returning "property"
        // type and treat "." as indepenent token.
        var token = editor.getTokenAt(cur);
        if (cur.ch == token.start + 1 && token.string.charAt(0) == '.') {
            token.end = token.start;
            token.string = '.';
            token.type = "property";
        }
        else if (/^\.[\w$_]*$/.test(token.string)) {
            token.type = "property";
            token.start++;
            token.string = token.string.replace(/\./, '');
        }
        return token;
    }

    /* javascriptHint */

    function oclHint(editor, options) {

        //return scriptHint(editor, suggestionsKeywords, getCoffeeScriptToken, options);
        return scriptHint(editor, suggestionsKeywords,
            function (e, cur) {
                return e.getTokenAt(cur);
            },
            options);
    }

    CodeMirror.registerHelper("hint", "text/x-ocl", oclHint);


    /*var stringProps = ("charAt charCodeAt indexOf lastIndexOf substring substr slice trim trimLeft trimRight " +
     "toUpperCase toLowerCase split concat match replace search").split(" ");

     var arrayProps = ("length concat join splice push pop shift unshift slice reverse sort indexOf " +
     "lastIndexOf every some filter forEach map reduce reduceRight ").split(" ");
     var funcProps = "prototype apply call bind".split(" ");*/

    var suggestionsKeywords = ("asSet asOrderedSet asSequence asBag flatten any size count isEmpty notEmpty first last" +
    " oclIsTypeOf oclIsKindOf oclIsInState oclIsNew oclAsType oclIsInState").split(" ");


    function forAllProps(obj, callback) {
        if (!Object.getOwnPropertyNames || !Object.getPrototypeOf) {
            for (var name in obj) callback(name)
        } else {
            for (var o = obj; o; o = Object.getPrototypeOf(o))
                Object.getOwnPropertyNames(o).forEach(callback)
        }
    }

    function getCompletions(token, context, keywords, options) {
        var found = [], start = token.string, global = options && options.globalScope || window;

        function maybeAdd(str) {
            if (str.lastIndexOf(start, 0) == 0 && !arrayContains(found, str)) found.push(str);
        }

        function gatherCompletions(obj) {
            /*if (typeof obj == "string") forEach(stringProps, maybeAdd);
             else if (obj instanceof Array) forEach(arrayProps, maybeAdd);
             else if (obj instanceof Function) forEach(funcProps, maybeAdd);*/

            forAllProps(obj, maybeAdd)
        }

        forEach(keywords, maybeAdd);


        if (context && context.length) {
            // If this is a property, see if it belongs to some object we can
            // find in the current environment.
            var obj = context.pop(), base;
            if (obj.type && obj.type.indexOf("variable") === 0) {
                base = "";
            } else if (obj.type == "string") {
                base = "";
            } else if (obj.type == "atom") {
                base = "";
            } else if (obj.type == "function") {
                base = "";
            }


        }
        return found;
    }
});