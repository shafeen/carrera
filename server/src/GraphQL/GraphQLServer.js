module.exports = {
    name: 'GraphQLServer', service: __,
    dependencies: [
        'require(apollo-server-express)', 'require(path)', 'require'
    ]
};

function __(apolloServerExpress, path, require) {
    // TODO: need to build require relative component!! (just require causes issues)

    const { ApolloServer, gql } = apolloServerExpress;
    const typeDefs = require(path.join(__dirname, './typedefs'))(gql);
    const resolvers = require(path.join(__dirname, './resolvers'));
    const context = ({ req }) => {
        const user = req.user;
        return { user };
    };
    return new ApolloServer({ typeDefs, resolvers, context });
}