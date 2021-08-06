import { IIteractiveSearch } from "../Interfaces/IIterativeSearch.js";
import { BaseHeuristic } from "./BaseHeuristic.js";
import { BaseHillClimbingState } from "./BaseHillClimbingState.js";

export abstract class BaseHillClimbingSearch<T extends BaseHillClimbingState> implements IIteractiveSearch<T> {
    
    public abstract iterateOnce(): T
    
    public heuristic: BaseHeuristic;

    public completeSearch(): T {
        while(!this.isCompleted){
            this.iterateOnce();
        }
        return this.state;
    }

    public get Heuristic() : BaseHeuristic {
        return this.heuristic
    }
    
    public get IsCompleted() : boolean {
        return this.isCompleted; 
    }

    public get State() : T {
        return this.state 
    }

    protected state: T
    protected isCompleted: boolean;
}