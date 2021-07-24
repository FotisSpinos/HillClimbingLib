export abstract class BaseHillClimbingState {
    expand(state: BaseHillClimbingState): BaseHillClimbingState[] {
        throw new Error("Not implemented");
    }
}