"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerbClass = exports.VerbVoice = exports.VerbRegularity = exports.VerbMood = exports.VerbTense = void 0;
var VerbTense;
(function (VerbTense) {
    VerbTense["Present"] = "present";
    VerbTense["PresentPerfect"] = "presentPerfect";
    VerbTense["Imperfect"] = "imperfect";
    VerbTense["Preterite"] = "preterite";
    VerbTense["PastPerfect"] = "pastPerfect";
    VerbTense["Future"] = "future";
    VerbTense["FuturePerfect"] = "futurePerfect";
    VerbTense["Conditional"] = "conditional";
    VerbTense["ConditionalPerfect"] = "conditionalPerfect";
    VerbTense["SubjunctivePresent"] = "subjunctivePresent";
    VerbTense["SubjunctivePerfect"] = "subjunctivePerfect";
    VerbTense["SubjunctiveImperfect"] = "subjunctiveImperfect";
    VerbTense["SubjunctivePastPerfect"] = "subjunctivePastPerfect";
    VerbTense["SubjunctiveFuture"] = "subjunctiveFuture";
    VerbTense["SubjunctiveFuturePerfect"] = "subjunctiveFuturePerfect";
})(VerbTense || (exports.VerbTense = VerbTense = {}));
var VerbMood;
(function (VerbMood) {
    VerbMood["Indicative"] = "indicative";
    VerbMood["Subjunctive"] = "subjunctive";
    VerbMood["Imperative"] = "imperative";
    VerbMood["Infinitive"] = "infinitive";
    VerbMood["Gerund"] = "gerund";
    VerbMood["Participle"] = "participle";
})(VerbMood || (exports.VerbMood = VerbMood = {}));
var VerbRegularity;
(function (VerbRegularity) {
    VerbRegularity["Regular"] = "regular";
    VerbRegularity["IrregularStem"] = "stemChange";
    VerbRegularity["IrregularAll"] = "irregular";
})(VerbRegularity || (exports.VerbRegularity = VerbRegularity = {}));
var VerbVoice;
(function (VerbVoice) {
    VerbVoice["Active"] = "active";
    VerbVoice["Passive"] = "passive";
})(VerbVoice || (exports.VerbVoice = VerbVoice = {}));
var VerbClass;
(function (VerbClass) {
    VerbClass["Transitive"] = "transitive";
    VerbClass["Intransitive"] = "intransitive";
    VerbClass["Pronominal"] = "pronominal";
    VerbClass["Copulative"] = "copulative";
    VerbClass["Impersonal"] = "impersonal";
})(VerbClass || (exports.VerbClass = VerbClass = {}));
// export enum ConjugationPattern {
// 	AR = 'ar',
// 	ER = 'er',
// 	IR = 'ir',
// 	E_IE = 'e->ie',
// 	O_UE = 'o->ue',
// 	E_I = 'e->i',
// 	U_UE = 'u->ue',
// 	I_IE = 'i->ie',
// 	G_ADDITION = 'g-add',
// 	C_ZC = 'c->zc',
// 	I_Y = 'i->y',
// 	IR_E_I = 'ir_e->i',
// 	ER_O_UE = 'er_o->ue',
// 	AR_E_IE = 'ar_e->ie',
// }
