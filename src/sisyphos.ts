/*
 * This file is part of Sisyphos-Hill-Climbing-Lib
 *
 * MIT License
 *
 * Copyright (c) 2023 Fotios Spinos
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.

/**
 * Implemented by all hill climbing search classes.
 */
interface IterativeSearch<StateType> {
    /**
     * Conducts a single hill climbing search iteration.
     * @returns The current state.
     */
    iterateOnce(): StateType

    /**
     * Completes the hill climbing search. Calls IterateOnce until the search is completed.
     * @returns The current state.
     */
    completeSearch(): StateType

    /**
     * @returns True if the hill climbing search is completed.
     */
    getIsCompleted(): boolean

    /**
     * @returns The current state.
     */
    getState(): StateType
}

/**
 * A base class providing helper functions and base functionality to all hill climbing search classes.
 */
abstract class HillClimbingSearch<StateType> implements IterativeSearch<StateType> {

    protected constructor(state: StateType, heuristic: (state: StateType) => number) {
        if (!state) {
            throw new Error("State should not be null.")
        }

        if (!heuristic) {
            throw new Error("Heuristic function should not be null.")
        }

        this.state = state
        this.heuristic = heuristic
        this.isCompleted = false
    }

    /**
     * Conducts a single hill climbing search iteration.
     */
    public abstract iterateOnce(): StateType

    /**
     * The heuristic providing the evaluation for a given state.
     */
    public heuristic: (state: StateType) => number

    /**
     * Calls iterateOnce until the search is completed.
     * @returns the current state.
     */
    public completeSearch(): StateType {
        while (!this.isCompleted) {
            this.iterateOnce()
        }

        return this.state
    }

    /**
     * @returns True if the hill climbing search is completed.
     */
    public getIsCompleted(): boolean {
        return this.isCompleted
    }

    /**
     * @returns The current state.
     */
    public getState(): StateType {
        return this.state
    }

    /**
     * The current state.
     */
    protected state: StateType

    /**
     * Set to true when the search is completed.
     */
    protected isCompleted: boolean

}

/**
 * On each iteration the algorithm determines the next state by picking the current state's highest ranking neighbor.
 */
export class HillClimbing<StateType> extends HillClimbingSearch<StateType> {
    public constructor(state: StateType, expand: (state: StateType) => StateType[], heuristic: (state: StateType) => number) {
        super(state, heuristic)
        this.expand = expand
    }

    /**
     * @returns The neighboring states that can be traversed from the given state.
     * @param state The state to expand.
     */
    public expand: (state: StateType) => StateType[]

    /**
     * Conducts a single hill climbing search iteration.
     */
    public iterateOnce(): StateType {
        let nextState = this.getBestExpandedState()

        // store next state or complete search
        if (nextState == null) {
            this.isCompleted = true
        } else {
            this.state = nextState
        }

        return this.state
    }

    protected getBestExpandedState(): StateType {
        let nextState = null
        let startStateEvaluation = this.heuristic(this.state)
        let max = startStateEvaluation
        let neighbors = this.expand(this.state)

        for (let i = 0; i < neighbors.length; i++) {
            let evaluation = this.heuristic(neighbors[i])

            if (evaluation > max) {
                max = evaluation
                nextState = neighbors[i]
            }
        }
        return nextState
    }
}

/**
 * On each iteration the first choice hill climbing search generates a new state until it's evaluation exceeds the current state.
 * The higher ranking state becomes the current state.
 */
export class FirstChoiceHillClimbing<StateType> extends HillClimbingSearch<StateType> {
    public constructor(
        state: StateType,
        expandSingle: (state: StateType) => StateType,
        heuristic: (state: StateType) => number,
        iterationsCount: number) {

        super(state, heuristic)

        this.expandSingle = expandSingle
        this.iterationsCount = iterationsCount
    }

    public iterateOnce(): StateType {
        let startEvaluation = this.heuristic(this.state)

        let evaluation = Number.NEGATIVE_INFINITY
        let neighbor = null
        let remainingIterations = this.iterationsCount

        do {
            if (remainingIterations <= 0) {
                this.isCompleted = true
                return this.state
            }
            remainingIterations--

            let neighbor = this.expandSingle(this.state)
            evaluation = this.heuristic(neighbor)
        } while (evaluation < startEvaluation)

        this.state = neighbor
        return this.state
    }

    private expandSingle: (state: StateType) => StateType

    private iterationsCount: number
}

/**
 * Restarts the hill climbing search with a randomly generated state until the number of restarts is reached.
 */
export class RandomRestartHillClimbing<StateType> extends HillClimbingSearch<StateType> {
    private bestState: StateType = null
    private remainingRestarts: number
    private hillClimbing: HillClimbing<StateType>

    /**
     * @returns A random state.
     */
    private randomState: () => StateType

    /**
     * @returns The neighboring states that can be traversed from the given state.
     * @param state The state to expand.
     */
    protected expand: (state: StateType) => StateType[]

    public constructor(state: StateType, expand: (state: StateType) => StateType[], heuristic: (state: StateType) => number, restarts: number, randomState: () => StateType) {
        super(state, heuristic)

        this.hillClimbing = new HillClimbing(state, expand, heuristic)
        this.remainingRestarts = restarts
        this.randomState = randomState
        this.expand = expand
    }

    public iterateOnce(): StateType {
        if (this.hillClimbing.getIsCompleted() && this.remainingRestarts >= 0) {
            // restart search
            this.hillClimbing = new HillClimbing(this.randomState(), this.expand, this.hillClimbing.heuristic)
            this.remainingRestarts--

            // record best state
            if (this.bestState == null) this.bestState = this.state
            else if (
                this.hillClimbing.heuristic(this.state) >
                this.hillClimbing.heuristic(this.bestState)
            ) {
                this.bestState = this.state
            }
        }

        // get new state
        let state = this.hillClimbing.iterateOnce()

        // if there are no remaining restarts and the current hill climbing search is completed
        // switch the state to completed
        if (this.remainingRestarts == 0 && this.hillClimbing.getIsCompleted())
            this.isCompleted = true

        return state
    }

    public getRemainingRestarts(): number {
        return this.remainingRestarts
    }

    public getBestState(): StateType {
        return this.bestState
    }
}

/**
 * On each iteration the algorithm generates a random state. The current state is replaced by the generated state if it's evaluation is higher.
 * If the generated state has a lower evaluation, the state might still be considered.
 *
 * - A high temperature makes the algorithm more likely to replace the current state with the generated state.
 * - The temperature is reduced on each iteration which makes the algorithm less likely to consider states with lower evaluations after the first iterations.
 * - The difference in evaluation between the current and generated states also determine the likeliness of considering the generated state.
 */
export class SimulatedAnnealing<StateType> extends HillClimbingSearch<StateType> {
    public minTemperature: number
    private temperature: number
    private iterationCount: number
    private initTemperature: number

    /**
     * @returns The neighboring states that can be traversed from the given state.
     * @param state The state to expand.
     */
    protected expand: (state: StateType) => StateType[]

    public constructor(state: StateType, expand: (state: StateType) => StateType[], heuristic: (state: StateType) => number, temperature: number, minTemperature: number) {
        super(state, heuristic)

        this.initTemperature = temperature
        this.temperature = temperature
        this.minTemperature = minTemperature
        this.expand = expand
    }

    public iterateOnce(): StateType {
        // cannot iterate if temperature has fallen to 0
        if (this.temperature <= this.minTemperature) {
            this.isCompleted = true
            return this.state
        }

        // calculate temperature
        this.iterationCount++
        this.temperature = this.initTemperature / this.iterationCount

        // evaluate current state
        let currentStateEvaluation = this.heuristic(this.state)

        // evaluate current neighbor state
        let randomNeighbor = this.getRandomNeighbor()
        let randomNeighborEvaluation = this.heuristic(randomNeighbor)

        // calculate difference
        let de = randomNeighborEvaluation - currentStateEvaluation

        // use neighbor's state if it ranks better than the current one
        if (de > 0) {
            this.state = randomNeighbor
        } else {
            // calculate the probability of navigating to a worse state
            let probability = Math.pow(Math.E, de / this.temperature)

            // set state if probability is met
            if (this.isProbabilityMet(probability)) {
                this.state = randomNeighbor
            }
        }

        return this.state
    }

    /**
     * Generates the current state's neighboring states and returns a random one.
     */
    protected getRandomNeighbor(): StateType {

        let neighbors = this.expand(this.state)
        let randomIndex = Math.floor(Math.random() * neighbors.length)
        let randomNeighbor = neighbors[randomIndex]

        return randomNeighbor
    }

    /**
     * Generates a random number and returns true if it is grater than the probability parameter.
     */
    protected isProbabilityMet(probability: number): Boolean {
        return probability > Math.random()
    }
}

