import { BaseHeuristic } from "../Abstract/BaseHeuristic.js";
import { BaseHillClimbingState } from "../Abstract/BaseHillClimbingState.js";
import { BaseHillClimbingSearch } from "../Abstract/BaseHillClimbingSearch.js";

export class HillClimbing <T extends BaseHillClimbingState> extends BaseHillClimbingSearch<T>{
    
    constructor(state: T, heuristic: BaseHeuristic) {
        super();
        
        this.state = state;
        this.heuristic = heuristic;
        this.isCompleted = false;
    }

    iterateOnce() : T {
        let currentState = this.state;
        let nextState = null;

        let startStateEvaluation = this.heuristic.evaluate(currentState);
        let max = startStateEvaluation;
        
        // Get neighbor states
        let neighbors = currentState.expand(this.state)

        for (let i = 0; i < neighbors.length; i++) {
            let evaluation = this.heuristic.evaluate(neighbors[i])

            if (evaluation > max) {
                max = evaluation
                nextState = neighbors[i]
            }
        }

        // store next state or complete search
        if (nextState == null) {
            this.isCompleted = true;
        }
        else {
            this.state = nextState;
        }

        return this.state;
    }
}