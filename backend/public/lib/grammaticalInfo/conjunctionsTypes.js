"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConjunctionFunction = exports.ConjunctionType = void 0;
var ConjunctionType;
(function (ConjunctionType) {
    ConjunctionType["coordinating"] = "coordinating";
    ConjunctionType["subordinating"] = "subordinating";
})(ConjunctionType || (exports.ConjunctionType = ConjunctionType = {}));
var ConjunctionFunction;
(function (ConjunctionFunction) {
    ConjunctionFunction["additive"] = "additive";
    ConjunctionFunction["adversative"] = "adversative";
    ConjunctionFunction["disjunctive"] = "disjunctive";
    ConjunctionFunction["causal"] = "causal";
    ConjunctionFunction["temporal"] = "temporal";
    ConjunctionFunction["conditional"] = "conditional";
    ConjunctionFunction["concessive"] = "concessive";
    ConjunctionFunction["consecutive"] = "consecutive";
    ConjunctionFunction["comparative"] = "comparative";
    ConjunctionFunction["final"] = "final";
    ConjunctionFunction["modal"] = "modal";
})(ConjunctionFunction || (exports.ConjunctionFunction = ConjunctionFunction = {}));
