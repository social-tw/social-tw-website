export class UrlGenerator {
    static genPostUrlById(id: string): string {
        return `/posts/${id}`
    }
}
