export class Post {
    constructor(
        public date: string,
        public content: string,
        public epochKey: string,
        public url: string,
    ) {}
}
