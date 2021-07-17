import { IHeuristic } from "./Heuristic";
import { HillClimbing } from "./HillClimbing";
import { IHillClimbingState } from "../Interfaces/IHillClimbingState";
import { IIterativeSearch } from "../Interfaces/IIterativeSearch";

class RandomStartHillClimbing implements IIterativeSearch {
    
    states: IHillClimbingState[];
    restartsNums: number;
    restartsProgress: number;
    hillClimbing: HillClimbing;
    completed: boolean;
    heuristic: IHeuristic;

    constructor(heuristic, states, restartsNums) {
        this.states = states;
        this.restartsNums = restartsNums;
        this.restartsProgress = 0;
        this.heuristic = heuristic;

        this.hillClimbing = null;
        this.completed = false;
    }

    getRandomState(): IHillClimbingState {
        let randomIndex = Math.floor(Math.random() * this.states.length);
        return this.states[randomIndex];
    }

    iterateOnce(): IHillClimbingState {
        if (this.hillClimbing == null) {
            this.hillClimbing.state = this.getRandomState();
        }

        this.hillClimbing.iterateOnce();

        if (this.hillClimbing.completed) {
            this.restartsProgress++;
            this.hillClimbing = null;
        }

        if(this.restartsProgress == this.restartsNums)
            this.completed = true;

            return this.hillClimbing.state;
    }

    completeSearch(): void {
        while(!this.completed)
            this.iterateOnce();
    }
}