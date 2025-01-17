"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrammaticalGender = exports.GrammaticalPerson = exports.GrammaticalNumber = exports.PartOfSpeech = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType["Word"] = "word";
    TokenType["Emoji"] = "emoji";
    TokenType["PunctuationSign"] = "punctuationSign";
})(TokenType || (exports.TokenType = TokenType = {}));
var PartOfSpeech;
(function (PartOfSpeech) {
    PartOfSpeech["Noun"] = "noun";
    PartOfSpeech["Verb"] = "verb";
    PartOfSpeech["Adjective"] = "adjective";
    PartOfSpeech["Adverb"] = "adverb";
    PartOfSpeech["Pronoun"] = "pronoun";
    PartOfSpeech["Determiner"] = "determiner";
    PartOfSpeech["Article"] = "article";
    PartOfSpeech["Preposition"] = "preposition";
    PartOfSpeech["Conjunction"] = "conjunction";
    PartOfSpeech["Interjection"] = "interjection";
    PartOfSpeech["Numeral"] = "numeral";
})(PartOfSpeech || (exports.PartOfSpeech = PartOfSpeech = {}));
var GrammaticalNumber;
(function (GrammaticalNumber) {
    GrammaticalNumber["Singular"] = "singular";
    GrammaticalNumber["Plural"] = "plural";
})(GrammaticalNumber || (exports.GrammaticalNumber = GrammaticalNumber = {}));
var GrammaticalPerson;
(function (GrammaticalPerson) {
    GrammaticalPerson["FirstSingular"] = "firstSingular";
    GrammaticalPerson["SecondSingular"] = "secondSingular";
    GrammaticalPerson["ThirdSingular"] = "thirdSingular";
    GrammaticalPerson["FirstPlural"] = "firstPlural";
    GrammaticalPerson["SecondPlural"] = "secondPlural";
    GrammaticalPerson["ThirdPlural"] = "thirdPlural";
})(GrammaticalPerson || (exports.GrammaticalPerson = GrammaticalPerson = {}));
var GrammaticalGender;
(function (GrammaticalGender) {
    GrammaticalGender["Masculine"] = "masculine";
    GrammaticalGender["Feminine"] = "feminine";
    GrammaticalGender["Neutral"] = "neutral";
    GrammaticalGender["Common"] = "common";
    GrammaticalGender["Ambiguous"] = "ambiguous";
})(GrammaticalGender || (exports.GrammaticalGender = GrammaticalGender = {}));
