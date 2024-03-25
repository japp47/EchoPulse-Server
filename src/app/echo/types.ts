export const types = `#graphql
input CreateEchoData {
    content: String!
    imageURL: String

}
    type Echo {
        id: ID!
        content: String!
        imageURL: String
        author: User
    }
`