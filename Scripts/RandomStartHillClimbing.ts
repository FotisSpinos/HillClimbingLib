// import { BaseHeuristic } from "../Abstract/BaseHeuristic";
// import { HillClimbing } from "./HillClimbing";
// import { BaseHillClimbingState } from "../Abstract/BaseHillClimbingState";
// import { IIterativeSearch } from "../Interfaces/IIterativeSearch";

// class RandomStartHillClimbing implements IIterativeSearch {
    
//     states: BaseHillClimbingState[];
//     restartsNums: number;
//     restartsProgress: number;
//     hillClimbing: HillClimbing;
//     completed: boolean;
//     heuristic: BaseHeuristic;

//     constructor(heuristic, states, restartsNums) {
//         this.states = states;
//         this.restartsNums = restartsNums;
//         this.restartsProgress = 0;
//         this.heuristic = heuristic;

//         this.hillClimbing = null;
//         this.completed = false;
//     }

//     getRandomState(): BaseHillClimbingState {
//         let randomIndex = Math.floor(Math.random() * this.states.length);
//         return this.states[randomIndex];
//     }

//     iterateOnce(): BaseHillClimbingState {
//         if (this.hillClimbing == null) {
//             this.hillClimbing.state = this.getRandomState();
//         }

//         this.hillClimbing.iterateOnce();

//         if (this.hillClimbing.completed) {
//             this.restartsProgress++;
//             this.hillClimbing = null;
//         }

//         if(this.restartsProgress == this.restartsNums)
//             this.completed = true;

//             return this.hillClimbing.state;
//     }

//     completeSearch(): void {
//         while(!this.completed)
//             this.iterateOnce();
//     }
// }