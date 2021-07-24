import { BaseHeuristic } from "../Abstract/BaseHeuristic";
import { BaseHillClimbingState } from "../Abstract/BaseHillClimbingState";
import { IIterativeSearch } from "../Interfaces/IIterativeSearch";

export class HillClimbing <T extends BaseHillClimbingState> {
    state: T;
    heuristic: BaseHeuristic;
    completed: boolean;
    highestEvaluation: number;

    constructor(state: T, heuristic: BaseHeuristic) {
        this.state = state;
        this.heuristic = heuristic;
        this.completed = false;

        this.highestEvaluation = this.heuristic.evaluate(this.state);
    }

    iterateOnce() : T {
        let currentState = this.state;
        let nextState = null;

        // TODO: Check if we need that, it looks like it never runs! 
        if (nextState != null)
            currentState = nextState;


        let neighbors = currentState.expand(this.state)

        let max = this.heuristic.evaluate(currentState);

        for (let i = 0; i < neighbors.length; i++) {
            let evaluation = this.heuristic.evaluate(neighbors[i])

            if (evaluation > max) {
                max = evaluation
                nextState = neighbors[i]
            }
        }
        
        console.log(`max ${max} heuristic ${this.heuristic.evaluate(currentState)}`)
        console.log(`difference: ${max - this.heuristic.evaluate(currentState)}`);

        if (max > this.highestEvaluation) {
            console.log(`This runs`);
            this.highestEvaluation = max;
            this.state = nextState;
        }
        else {
            this.completed = true;
        }

        return this.state;
    }

    completeSearch(): BaseHillClimbingState {
 
        //! This looks unecessary, we can just run iterate once until this.complete == true
 
        let currentState = this.state;
        let nextState = null;
        let iterations = 0

        do {

            if (nextState != null)
                currentState = nextState;

            let neighbors = currentState.expand(currentState)

            let max = Number.NEGATIVE_INFINITY;

            for (let i = 0; i < neighbors.length; i++) {
                let evaluation = this.heuristic.evaluate(neighbors[i])

                if (evaluation > max) {
                    max = evaluation
                    nextState = neighbors[i]
                }
            }
            iterations++;
        } while (this.heuristic.evaluate(currentState) <= this.heuristic.evaluate(nextState) && iterations < 100)

        this.completed = true;

        if (iterations == 100) {
            console.log(`The search was not completed successfully`);
        }

        return currentState;
    }
}