import { BaseHillClimbingState } from "./BaseHillClimbingState.js";

export abstract class BaseHeuristic
{
    evaluate(state: BaseHillClimbingState): number{
        throw new Error("Not Implemented method");
    }
}