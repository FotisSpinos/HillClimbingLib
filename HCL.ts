export interface IIterativeSearch<T> {

    iterateOnce(): T

    completeSearch(): T

    getIsCompleted(): boolean

    getState(): T
}

export abstract class BaseHillClimbingSearch<T extends BaseHillClimbingState> implements IIterativeSearch<T> {
    public abstract iterateOnce(): T

    public heuristic: (state: BaseHillClimbingState) => number

    public completeSearch(): T {
        while (!this.isCompleted) {
            this.iterateOnce()
        }
        return this.state
    }

    public getIsCompleted(): boolean {
        return this.isCompleted
    }

    public getState(): T {
        return this.state
    }

    protected state: T
    
    protected isCompleted: boolean


    protected getRandomNeighbor(): T {
        let neighbors = this.state.expand()

        let randomIndex = getRandomInt(neighbors.length)
        let randomNeighbor = neighbors[randomIndex]

        return randomNeighbor as T
    }

    protected getAndRemoveRandomNeighbor(): T {
        let neighbors = this.state.expand()

        let randomIndex = getRandomInt(neighbors.length)
        let randomNeighbor = neighbors[randomIndex]

        neighbors.slice(randomIndex, 1)

        return randomNeighbor as T
    }
}

export abstract class BaseHillClimbingState {
    expand(): BaseHillClimbingState[] {
        throw new Error("Not implemented")
    }
}

export class FirstChoiceHillClimbing<T extends BaseHillClimbingState> extends BaseHillClimbingSearch<T>{

    constructor(state: T, heuristic: (state: BaseHillClimbingState) => number) {
        super()

        this.state = state
        this.heuristic = heuristic
        this.isCompleted = false
    }

    public iterateOnce(): T {
        let startStateEvaluation = this.heuristic(this.state)

        let randomNeighborEvaluation = Number.NEGATIVE_INFINITY
        let randomNeighbor = null

        let remainingIterations = this.state.expand().length

        do {
            if (remainingIterations <= 0) {
                this.isCompleted = true
                return this.state
            }
            remainingIterations--

            // Get random neighbor
            randomNeighbor = this.getAndRemoveRandomNeighbor()
            randomNeighborEvaluation = this.heuristic(randomNeighbor)
        }
        while (randomNeighborEvaluation < startStateEvaluation)

        this.state = randomNeighbor

        return this.state
    }
}

export class HillClimbing<T extends BaseHillClimbingState> extends BaseHillClimbingSearch<T>{

    constructor(state: T, heuristic: (state: BaseHillClimbingState) => number) {
        super()

        this.state = state
        this.heuristic = heuristic
        this.isCompleted = false
    }

    public iterateOnce(): T {
        let currentState = this.state
        let nextState = null

        let startStateEvaluation = this.heuristic(currentState)
        let max = startStateEvaluation

        // Get neighbor states
        let neighbors = currentState.expand()

        for (let i = 0;  i <neighbors.length;  i++) {
            let evaluation = this.heuristic(neighbors[i])

            if (evaluation > max) {
                max = evaluation
                nextState = neighbors[i]
            }
        }

        // store next state or complete search
        if (nextState == null) {
            this.isCompleted = true
        }
        else {
            this.state = nextState
        }

        return this.state
    }
}

export class RandomRestartHillClimbing<T extends BaseHillClimbingState> extends BaseHillClimbingSearch<T> {
    bestState: T = null

    private remainingRestarts: number
    private hillClimbing: HillClimbing<T>
    private createRandomState: () => T

    constructor(state: T, heuristic: (state: BaseHillClimbingState) => number, restarts: number, createRandomState: () => T) {
        super()

        this.hillClimbing = new HillClimbing(state, heuristic)
        this.remainingRestarts = restarts
        this.createRandomState = createRandomState
    }

    public iterateOnce(): T {
        if (this.hillClimbing.getIsCompleted && this.remainingRestarts >= 0) {

            // restart search
            this.hillClimbing = new HillClimbing(this.createRandomState(), this.hillClimbing.heuristic)
            this.remainingRestarts--

            // record best state
            if (this.bestState == null)
                this.bestState = this.state
            else if (this.hillClimbing.heuristic(this.state) > this.hillClimbing.heuristic(this.bestState)) {
                this.bestState = this.state
            }
        }

        // get new state 
        let state = this.hillClimbing.iterateOnce()

        // if there are no remaining restarts and the current hill climbing search is completed
        // switch the state to completed
        if (this.remainingRestarts == 0 && this.hillClimbing.getIsCompleted)
            this.isCompleted = true

        return state
    }
}

export class SimulatedAnnealing<T extends BaseHillClimbingState> extends BaseHillClimbingSearch<T>{

    public minTemperature: number

    private temperature: number = 0
    private iterationCount: number = 0
    private initTemperature: number = 0

    constructor(state: T, heuristic: (state: BaseHillClimbingState) => number, temperature: number, minTemperature: number) {
        super()

        this.state = state
        this.heuristic = heuristic
        this.isCompleted = false

        this.initTemperature = temperature
        this.temperature = temperature
        this.minTemperature = minTemperature
    }

    public iterateOnce(): T {
        // cannot iterate if temperature has fallen to 0
        if (this.temperature <= this.minTemperature) {
            this.isCompleted = true
            return this.state
        }

        // calculate temperature
        this.iterationCount++
        this.temperature = (this.initTemperature / (this.iterationCount))

        // evaluate current state
        let currentStateEvaluation = this.heuristic(this.state)

        // evaluate current neighbor state
        let randomNeighbor = this.getRandomNeighbor()
        let randomNeighborEvaluation = this.heuristic(randomNeighbor)

        // calculate difference
        let de = randomNeighborEvaluation - currentStateEvaluation

        // use neighbor's state if it ranks better than the current one
        if (de > 0) {
            this.state = randomNeighbor as T
        }
        else {
            // calculate the probability of navigating to a worse state
            let probability = Math.pow(Math.E, (de / this.temperature))

            // set state if probability is met
            if (isProbabilityMet(probability)) {
                this.state = randomNeighbor as T
            }
        }

        return this.state
    }
}

function getRandomInt(max: number): number {
    return Math.floor(Math.random() * max)
}

function isProbabilityMet(probability: number): Boolean {
    return probability > Math.random()
}