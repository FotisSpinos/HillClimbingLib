import { BaseHeuristic } from "../Abstract/BaseHeuristic";
import { BaseHillClimbingState } from "../Abstract/BaseHillClimbingState";
import { IIterativeSearch } from "../Interfaces/IIterativeSearch";
import { HillClimbing } from "./HillClimbing.js";

export class RandomRestartHillClimbing <T extends BaseHillClimbingState> implements IIterativeSearch<T>{
    state: T;
    heuristic: BaseHeuristic;
    isCompleted: boolean;
    bestState: T = null;

    private remainingRestarts: number
    private hillClimbing: HillClimbing<T>
    private createRandomState: () => T

    constructor(state: T, heuristic: BaseHeuristic, restarts: number, createRandomState: () => T ) {
        this.hillClimbing = new HillClimbing(state, heuristic)
        this.remainingRestarts = restarts
        this.createRandomState = createRandomState
    }

    iterateOnce() : T {
        if(this.hillClimbing.isCompleted && this.remainingRestarts >= 0) {

            // restart search
            this.hillClimbing = new HillClimbing(this.createRandomState(), this.hillClimbing.heuristic);
            this.remainingRestarts--

            // record best state
            if(this.bestState == null)
                this.bestState = this.state
            else if(this.hillClimbing.heuristic.evaluate(this.state) > this.hillClimbing.heuristic.evaluate(this.bestState)){
                this.bestState = this.state
            }
        }

        // get new state 
        let state = this.hillClimbing.iterateOnce();

        // if there are no remaining restarts and the current hill climbing search is completed
        // switch the state to completed
        if(this.remainingRestarts == 0 && this.hillClimbing.isCompleted)
            this.isCompleted = true

        return state
    }

    completeSearch(): T {
        while(!this.isCompleted){
            this.iterateOnce();
        }
        
        return this.state;
    }
}