export interface IIteractiveSearch<T> {
    
    iterateOnce(): T
    
    completeSearch(): T
    
    get IsCompleted() : boolean

    get State() : T
}