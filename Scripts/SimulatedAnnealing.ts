import { BaseHeuristic } from "../Abstract/BaseHeuristic";
import { BaseHillClimbingState } from "../Abstract/BaseHillClimbingState";
import { IIterativeSearch } from "../Interfaces/IIterativeSearch";

export class SimulatedAnnealing <T extends BaseHillClimbingState> implements IIterativeSearch<T>{
    public state: T;
    public heuristic: BaseHeuristic;
    public isCompleted: boolean;
    public minTemperature: number;
    
    private temperature: number = 0;
    private iterationCount: number = 0;
    private initTemperature: number = 0;

    constructor(state: T, heuristic: BaseHeuristic, temperature: number, minTemperature: number){
        this.state = state;
        this.heuristic = heuristic;
        this.isCompleted = false;

        this.initTemperature = temperature;
        this.temperature = temperature;
        this.minTemperature = minTemperature;
    }

    iterateOnce(): T {
        // cannot iterate if temperature has fallen to 0
        if(this.temperature <= this.minTemperature) {
            this.isCompleted = true;
            return this.state;
        }

        // calculate temperature
        this.iterationCount++
        this.temperature = (this.initTemperature / (this.iterationCount));

        // evaluate current state
        let currentStateEvaluation = this.heuristic.evaluate(this.state);
                
        // evaluate current neighbor state
        let randomNeighbor = this.getRandomNeighbor()
        let randomNeighborEvaluation = this.heuristic.evaluate(randomNeighbor)

        // calculate difference
        let de = randomNeighborEvaluation - currentStateEvaluation;

        // use neighbor's state if it ranks better than the current one
        if(de > 0) {
            this.state = randomNeighbor as T;
        }
        else{
            // calculate the probability of navigating to a worse state
            let probability = Math.pow(Math.E, (de / this.temperature));
            
            // set state if probability is met
            if(this.isProbabilityMet(probability)){
                this.state = randomNeighbor as T
            }
        }
                
        return this.state;
    }

    private getRandomInt(max: number) : number {
        return Math.floor(Math.random() * max)
    }

    private isProbabilityMet(probability: number) : Boolean{
        return probability > Math.random();     
    }

    private getRandomNeighbor(): T {
        let neighbors = this.state.expand(this.state)

        let randomIndex = this.getRandomInt(neighbors.length);
        let randomNeighbor = neighbors[randomIndex]
        
        return randomNeighbor as T;
    }
    
    completeSearch(): T {
        while(!this.isCompleted){
            this.iterateOnce();
        }
        return this.state;
    }
}