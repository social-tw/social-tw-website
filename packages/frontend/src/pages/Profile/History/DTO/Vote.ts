export class Vote {
    constructor(
        public date: string,
        public content: string,
        public type: string,
        public epochKey: string,
        public url: string,
    ) {}
}
