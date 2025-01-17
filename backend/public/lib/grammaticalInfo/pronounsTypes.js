"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PronounCase = exports.PronounType = void 0;
var PronounType;
(function (PronounType) {
    PronounType["Personal"] = "personal";
    PronounType["Demonstrative"] = "demonstrative";
    PronounType["Possessive"] = "possessive";
    PronounType["Relative"] = "relative";
    PronounType["Interrogative"] = "interrogative";
    PronounType["Exclamative"] = "exclamative";
    PronounType["Indefinite"] = "indefinite";
    PronounType["Negative"] = "negative";
})(PronounType || (exports.PronounType = PronounType = {}));
var PronounCase;
(function (PronounCase) {
    PronounCase["Nominative"] = "nominative";
    PronounCase["Accusative"] = "accusative";
    PronounCase["Dative"] = "dative";
    PronounCase["Prepositional"] = "prepositional";
})(PronounCase || (exports.PronounCase = PronounCase = {}));
