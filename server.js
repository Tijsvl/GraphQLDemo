const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql')
const app = express()

// Import Dummy Data to act as database
const { players, positions } = require('./dummyData.js')
// players: {id, name, squadNumber}
// positions: {id, position, playerId}

const PositionType = new GraphQLObjectType({
  name: 'Position',
  description: 'The players preferred field positions',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    position: { type: GraphQLNonNull(GraphQLString) },
    playerId: { type: GraphQLNonNull(GraphQLInt) },
    player: {
      type: PlayerType,
      resolve: (position) => {
        return players.find((player) => player.id === position.playerId)
      }
    }
  })
})

const PlayerType = new GraphQLObjectType({
  name: 'Player',
  description: "The player's name",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    squadNumber: { type: GraphQLNonNull(GraphQLString) },
    positions: {
      type: new GraphQLList(PositionType),
      resolve: (player) => {
        return positions.filter((position) => position.playerId === player.id)
      }
    }
  })
})

const squadNumber = new GraphQLObjectType({
  name: 'squadNumber',
  description: "The player's Squad Number",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    squadNumber: { type: GraphQLNonNull(GraphQLString) },
    positions: {
      type: new GraphQLList(PositionType),
      resolve: (player) => {
        return positions.filter((position) => position.playerId === player.id)
      }
    }
  })
})

// Define Queries
const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    // List all players
    players: {
      type: new GraphQLList(PlayerType),
      description: 'List of all players',
      resolve: () => players
    },

    // Query by player ID
    player: {
      type: PlayerType,
      description: 'An indivual player',
      args: {
        id: {
          type: GraphQLInt
        }
      },
      resolve: (parents, args) =>
        players.find((player) => player.id === args.id)
    },

    // List all positions
    positions: {
      type: new GraphQLList(PositionType),
      description: 'List of all positions',
      resolve: () => positions
    },

    // Query by position
    position: {
      type: PositionType,
      description: 'An indivual position',
      args: {
        id: {
          type: GraphQLInt
        }
      },
      resolve: (parents, args) =>
        positions.find((position) => position.id === args.id)
    },

    // Query by Squad Number
    squadNumber: {
      type: squadNumber,
      description: 'A Squad Number',
      args: {
        number: {
          type: GraphQLInt
        }
      },
      resolve: (parents, args) =>
        players.find((player) => player.squadNumber === args.number)
    }
  })
})

// Define Mutations
const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    // Add a new position
    addPosition: {
      type: PositionType,
      description: 'Add a position',
      args: {
        position: { type: GraphQLNonNull(GraphQLString) },
        playerId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        // Create new ID for test purposes
        // ID would normally be automatically generated
        const position = {
          id: positions.length + 1,
          position: args.position,
          playerId: args.playerId
        }
        positions.push(position)
        return position
      }
    },

    // Add a player
    addPlayer: {
      type: PlayerType,
      description: 'Add a player',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        squadNumber: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        // Create new ID for test purposes
        // ID would normally be automatically generated
        const player = {
          id: players.length + 1,
          name: args.name,
          squadNumber: args.squadNumber
        }
        players.push(player)
        return player
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true
  })
)

// Port to listen to
app.listen(5555, () => console.log(`Server running`))

// MUTATION AND QUERY EXAMPLES

// // Add a player
// mutation {
//   addPlayer(name: "Last name, First name", squadNumber: 35) {
//     name
//     squadNumber
//   }
// }

// Add a new position
// mutation {
//   addPosition(playerId: 5, position: "Coach") {
//     position
//     id
//   }
// }

// // Retrieve individual player by id
// query {
//   player(id: 2) {
//     name
//     squadNumber
//     positions {
//       position
//     }
//   }
// }

// // Retrieve individual player by Squad Number
// query {
//   squadNumber(number: 2) {
//     squadNumber
//     name
//     positions {
//       position
//     }
//   }
// }

// // Retrieve all players
// query {
//   players {
//     name
//     id
//     squadNumber
//     positions {
//       position
//     }
//   }
// }

// // Retrieve single position
// query {
//   position(id: 4) {
//     position
//     player {
//       name
//     }
//   }
// }

// // Retrieve all positions
// query {
//   positions {
//     position
//     player {
//       name
//       squadNumber
//     }
//   }
// }
