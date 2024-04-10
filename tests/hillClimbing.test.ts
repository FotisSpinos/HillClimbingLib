import { HillClimbingState, FirstChoiceHillClimbing, HillClimbing } from "../src/sisyphos";

describe("HillClimbing", () => {
    class Path implements HillClimbingState<Path> {
        public static maxHeight = 3;

        public static first(): Path {
            return new Path(0);
        }

        public getHeight() {
            return this.height;
        }

        public expand(): Path[] {
            if (this.height == Path.maxHeight) {
                return [];
            }

            return [new Path(this.height - 1), new Path(this.height + 1)];
        }

        private constructor(height: number) {
            this.height = height;
        }

        private height: number = 0;
    }

    test("Complete Search", () => {
        let path = Path.first();
        let search = new HillClimbing(path, (x) => x.getHeight());
        let result = search.completeSearch();
        expect(result.getHeight() == Path.maxHeight);
    });

    test("Iterative Search", () => {
        let path = Path.first();
        let search = new HillClimbing(path, (x) => x.getHeight());
        let result = search.iterateOnce();
        expect(result.getHeight() == 1);
    });

    test("Complete Query", () => {
        let path = Path.first();
        let search = new HillClimbing(path, (x) => x.getHeight());

        search.iterateOnce();
        expect(!search.getIsCompleted());

        search.iterateOnce();
        expect(!search.getIsCompleted());

        search.iterateOnce();
        expect(search.getIsCompleted());
    });
});

describe("FirstChoiceHillClimbing", () => {
    class CrossRoad implements HillClimbingState<CrossRoad> {
        public static maxHeight = 100;

        public static first(): CrossRoad {
            return new CrossRoad(0);
        }

        public getHeight() {
            return this.height;
        }

        public expand(): CrossRoad[] {
            if (this.height > CrossRoad.maxHeight) {
                return [];
            }

            let output = [];
            for (let i = 0; i < 10; i++) {
                output.push(
                    new CrossRoad(this.height + Math.floor(Math.random() * 10))
                );
            }
            return output;
        }

        private constructor(height: number) {
            this.height = height;
        }

        private height: number = 0;
    }

    test("Complete Search", () => {
        let path = CrossRoad.first();
        let search = new FirstChoiceHillClimbing(path, (x) =>
            (x as CrossRoad).getHeight()
        );
        let result = search.completeSearch();
        expect(result.getHeight() == CrossRoad.maxHeight);
    });

    test("Iterative Search", () => {
        let path = CrossRoad.first();
        let search = new FirstChoiceHillClimbing(path, (x) =>
            (x as CrossRoad).getHeight()
        );
        let height = search.iterateOnce().getHeight();
        expect(height > 0 && height < CrossRoad.maxHeight);
    });

    test("Completed Query", () => {
        let path = CrossRoad.first();
        let search = new FirstChoiceHillClimbing(path, (x) =>
            (x as CrossRoad).getHeight()
        );
        let result = search.completeSearch();
        expect(result.getHeight() == CrossRoad.maxHeight);
    });
});
