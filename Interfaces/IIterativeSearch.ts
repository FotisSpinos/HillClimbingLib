import { BaseHillClimbingState } from "../Abstract/BaseHillClimbingState";

export interface IIterativeSearch<T extends BaseHillClimbingState> {
    iterateOnce(): T
    completeSearch(): T
}