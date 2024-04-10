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
export interface IIterativeSearch<T> {
    /**
     * Conducts a single hill climbing search iteration.
     */
    iterateOnce(): T;

    /**
     * Completes the hill climbing search. Calls IterateOnce until the search is completed.
     */
    completeSearch(): T;

    /**
     * Returns true if the hill climbing search is completed.
     */
    getIsCompleted(): boolean;

    /**
     * Returns the current state.
     */
    getState(): T;
}

/**
 * A base class providing helper functions and base functionality to all hill climbing search classes.
 */
export abstract class BaseHillClimbingSearch<T extends BaseHillClimbingState>
    implements IIterativeSearch<T> {
    protected constructor(
        state: T,
        heuristic: (state: BaseHillClimbingState) => number
    ) {
        if (!state) {
            throw new Error("State should be a valid instance");
        }

        if (!heuristic) {
            throw new Error("Heuristic should be a valid instance");
        }

        this.state = state;
        this.heuristic = heuristic;
        this.isCompleted = false;
    }

    /**
     * Conducts a single hill climbing search iteration.
     */
    public abstract iterateOnce(): T;

    /**
     * The heuristic providing the evaluation for a given state.
     */
    public heuristic: (state: BaseHillClimbingState) => number;

    /**
     * Calls iterateOnce until the search is completed.
     * @returns the current state.
     */
    public completeSearch(): T {
        while (!this.isCompleted) {
            this.iterateOnce();
        }

        return this.state;
    }

    /**
     * Returns true if the hill climbing search is completed.
     */
    public getIsCompleted(): boolean {
        return this.isCompleted;
    }

    /**
     * Returns the current state.
     */
    public getState(): T {
        return this.state;
    }

    /**
     * The current state.
     */
    protected state: T;

    /**
     * Set to true when the search is completed.
     */
    protected isCompleted: boolean;

    /**
     * Generates the current state's neighboring states and returns a random one.
     */
    protected getRandomNeighbor(): T {
        let neighbors = this.state.expand();

        let randomIndex = getRandomInt(neighbors.length);
        let randomNeighbor = neighbors[randomIndex];

        return randomNeighbor as T;
    }

    public getBestExpandedState(): T {
        let nextState = null;
        let startStateEvaluation = this.heuristic(this.state);
        let max = startStateEvaluation;
        let neighbors = this.state.expand();

        for (let i = 0; i < neighbors.length; i++) {
            let evaluation = this.heuristic(neighbors[i]);

            if (evaluation > max) {
                max = evaluation;
                nextState = neighbors[i];
            }
        }
        return nextState as T;
    }
}

/**
 * A base class representing a state.
 */
export abstract class BaseHillClimbingState {
    /**
     * Returns all neighboring states.
     */
    abstract expand(): BaseHillClimbingState[];
}

/**
 * On each iteration the algorithm determines the next state by picking the current state's highest ranking neighbor.
 */
export class HillClimbing<
    T extends BaseHillClimbingState
> extends BaseHillClimbingSearch<T> {
    public constructor(
        state: T,
        heuristic: (state: BaseHillClimbingState) => number
    ) {
        super(state, heuristic);
    }

    /**
     * Conducts a single hill climbing search iteration.
     */
    public iterateOnce(): T {
        let nextState = this.getBestExpandedState();

        // store next state or complete search
        if (nextState == null) {
            this.isCompleted = true;
        } else {
            this.state = nextState;
        }

        return this.state;
    }
}

/**
 * On each iteration the first choice hill climbing search generates a new state until it's evaluation exceeds the current state.
 * The higher ranking state becomes the current state.
 */
export class FirstChoiceHillClimbing<
    T extends BaseHillClimbingState
> extends BaseHillClimbingSearch<T> {
    public constructor(
        state: T,
        heuristic: (state: BaseHillClimbingState) => number
    ) {
        super(state, heuristic);
    }

    public iterateOnce(): T {
        let startStateEvaluation = this.heuristic(this.state);

        let randomNeighborEvaluation = Number.NEGATIVE_INFINITY;
        let randomNeighbor = null;

        // Get random neighbor
        let neighbors = this.state.expand();

        let remainingIterations = neighbors.length;

        do {
            if (remainingIterations <= 0) {
                this.isCompleted = true;
                return this.state;
            }
            remainingIterations--;

            let randomIndex = getRandomInt(neighbors.length);
            randomNeighbor = neighbors[randomIndex];

            neighbors.splice(randomIndex, 1);
            randomNeighborEvaluation = this.heuristic(randomNeighbor);
        } while (randomNeighborEvaluation < startStateEvaluation);

        this.state = randomNeighbor as T;

        return this.state;
    }
}

/**
 * Restarts the hill climbing search with a randomly generated state until the number of restarts is reached.
 */
export class RandomRestartHillClimbing<
    T extends BaseHillClimbingState
> extends BaseHillClimbingSearch<T> {
    private bestState: T = null;
    private remainingRestarts: number;
    private hillClimbing: HillClimbing<T>;
    private createRandomState: () => T;

    public constructor(
        state: T,
        heuristic: (state: BaseHillClimbingState) => number,
        restarts: number,
        createRandomState: () => T
    ) {
        super(state, heuristic);

        this.hillClimbing = new HillClimbing(state, heuristic);
        this.remainingRestarts = restarts;
        this.createRandomState = createRandomState;
    }

    public iterateOnce(): T {
        if (this.hillClimbing.getIsCompleted() && this.remainingRestarts >= 0) {
            // restart search
            this.hillClimbing = new HillClimbing(
                this.createRandomState(),
                this.hillClimbing.heuristic
            );
            this.remainingRestarts--;

            // record best state
            if (this.bestState == null) this.bestState = this.state;
            else if (
                this.hillClimbing.heuristic(this.state) >
                this.hillClimbing.heuristic(this.bestState)
            ) {
                this.bestState = this.state;
            }
        }

        // get new state
        let state = this.hillClimbing.iterateOnce();

        // if there are no remaining restarts and the current hill climbing search is completed
        // switch the state to completed
        if (this.remainingRestarts == 0 && this.hillClimbing.getIsCompleted())
            this.isCompleted = true;

        return state;
    }

    public getRemainingRestarts(): number {
        return this.remainingRestarts;
    }

    public getBestState(): T {
        return this.bestState;
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
export class SimulatedAnnealing<
    T extends BaseHillClimbingState
> extends BaseHillClimbingSearch<T> {
    public minTemperature: number;

    private temperature: number = 0;
    private iterationCount: number = 0;
    private initTemperature: number = 0;

    public constructor(
        state: T,
        heuristic: (state: BaseHillClimbingState) => number,
        temperature: number,
        minTemperature: number
    ) {
        super(state, heuristic);

        this.initTemperature = temperature;
        this.temperature = temperature;
        this.minTemperature = minTemperature;
    }

    public iterateOnce(): T {
        // cannot iterate if temperature has fallen to 0
        if (this.temperature <= this.minTemperature) {
            this.isCompleted = true;
            return this.state;
        }

        // calculate temperature
        this.iterationCount++;
        this.temperature = this.initTemperature / this.iterationCount;

        // evaluate current state
        let currentStateEvaluation = this.heuristic(this.state);

        // evaluate current neighbor state
        let randomNeighbor = this.getRandomNeighbor();
        let randomNeighborEvaluation = this.heuristic(randomNeighbor);

        // calculate difference
        let de = randomNeighborEvaluation - currentStateEvaluation;

        // use neighbor's state if it ranks better than the current one
        if (de > 0) {
            this.state = randomNeighbor as T;
        } else {
            // calculate the probability of navigating to a worse state
            let probability = Math.pow(Math.E, de / this.temperature);

            // set state if probability is met
            if (isProbabilityMet(probability)) {
                this.state = randomNeighbor as T;
            }
        }

        return this.state;
    }
}

/**
 * Returns a random integer between 0 and "max".
 */
function getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
}

/**
 * Generates a random number and returns true if it is grater than the probability parameter.
 */
function isProbabilityMet(probability: number): Boolean {
    return probability > Math.random();
}
