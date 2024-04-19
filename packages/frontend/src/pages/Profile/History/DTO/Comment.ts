export class Comment {
    constructor(
        public id: string,
        public postId: string,
        public epochKey: string,
        public publishedAt: number,
        public content: string,
        public voteSum: number,
        public date: string,
        public url: string,
    ) {}
}
