import { BaseHeuristic } from "../Abstract/BaseHeuristic";
import { BaseHillClimbingState } from "../Abstract/BaseHillClimbingState";
import { IIterativeSearch } from "../Interfaces/IIterativeSearch";

export class FirstChoiceHillClimbing <T extends BaseHillClimbingState> implements IIterativeSearch<T>{
    state: T;
    heuristic: BaseHeuristic;
    isCompleted: boolean;
 
    constructor(state: T, heuristic: BaseHeuristic) {
        this.state = state;
        this.heuristic = heuristic;
        this.isCompleted = false;
    }

    iterateOnce() : T {
        let startStateEvaluation = this.heuristic.evaluate(this.state);
        
        let randomNeighborEvaluation = Number.NEGATIVE_INFINITY
        let randomNeighbor = null

        let remainingIterations = this.state.expand(this.state).length;

        do{
            if(remainingIterations <= 0){
                return this.state
            }
            remainingIterations--

            // Get random neighbor
            randomNeighbor = this.getAndRemoveRandomNeighbor()
            randomNeighborEvaluation = this.heuristic.evaluate(randomNeighbor)
        }
        while(randomNeighborEvaluation < startStateEvaluation)

        this.state = randomNeighbor

        return this.state;
    }

    completeSearch(): T {
        while(!this.isCompleted){
            this.iterateOnce();
        }
        
        return this.state;
    }

    private getAndRemoveRandomNeighbor(): T {
        let neighbors = this.state.expand(this.state)

        let randomIndex = this.getRandomInt(neighbors.length);
        let randomNeighbor = neighbors[randomIndex]
        
        neighbors.slice(randomIndex, 1);

        return randomNeighbor as T;
    }

    private getRandomInt(max: number) : number {
        return Math.floor(Math.random() * max)
    }
}