import { FirstChoiceHillClimbing, HillClimbing, RandomRestartHillClimbing } from "../src/sisyphos";

describe("HillClimbing", () => {
    const points = [1, 2, 5, 6, 1]
    const max = Math.max(...points)

    function getSearch() {
        let state = {
            points: points,
            index: 0,
            value() { return this.points[this.index] }
        }
        let search = new HillClimbing(state,
            function (x) {
                x.index++
                return [x]
            },
            function (x) {
                return x.value()
            })
        return search
    }

    test("Complete Search", () => {

        const search = getSearch()
        const result = search.completeSearch()
        expect(result.value() == max)
    })

    test("Iterative Search", () => {
        const search = getSearch()
        const result = search.iterateOnce()
        expect(result.value() == points[1])
    })

    test("Complete Query", () => {
        const search = getSearch()

        search.iterateOnce()
        expect(!search.getIsCompleted())

        search.iterateOnce()
        expect(!search.getIsCompleted())

        search.iterateOnce()
        expect(!search.getIsCompleted())

        search.iterateOnce()
        expect(!search.getIsCompleted())

        search.iterateOnce()
        expect(search.getIsCompleted())
    });
});

describe("RandomRestartHillClimbing", () => {
    const points = [1, 3, 5, 4, 6]
    const max = Math.max(...points)

    function getSearch() {
        let state = {
            points: points,
            index: 0,
            value() { return this.points[this.index] }
        }
        let search = new RandomRestartHillClimbing(state,
            function (x) {
                x.index++
                return [x]
            },
            function (x) {
                return x.value()
            },
            10,

            function () {
                const randState = { ...state }
                randState.index = Math.floor(Math.random() * points.length)
                return randState
            }
        )
        return search
    }

    test("Complete Search", () => {
        const search = getSearch()
        const result = search.completeSearch();
        expect(result.value() == max);
    });

    test("Iterative Search", () => {
        const search = getSearch()
        const current = search.getState()

        const result = search.iterateOnce();
        expect(result.value() >= current.value());
    });

    test("Complete Query", () => {
        const search = getSearch()

        search.iterateOnce();
        expect(!search.getIsCompleted());

        search.completeSearch();
        expect(search.getIsCompleted());
    });
});
