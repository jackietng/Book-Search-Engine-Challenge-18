import { type UserDocument } from '../models/User.js';
import { signToken } from '../services/auth.js';
import User from '../models/User.js';
import { GraphQLError } from 'graphql';

// Define the resolvers for the queries and mutations
const resolvers = {
    Query: {
      // Resolver for the 'me' query to fetch the currently authenticated user
      me: async (_: any, __: any, context: { user?: UserDocument }) => {
        // Check if there is a user in the context (if the user is logged in)
        if (!context.user) {
          throw new GraphQLError('You need to be logged in!', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }
        // If a user is found, return the user data
        return User.findOne({ _id: context.user._id });
      }
    },

  Mutation: {
    // Resolver for the 'addUser' mutation to create a new user
    addUser: async (_: any, args: { username: string; email: string; password: string }) => {
      // Create a new user with the 'args' data
      const user = await User.create(args);
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    // Resolver for the 'login' mutation to log in an existing user
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      // Find a user with the provided email
        const user = await User.findOne({ email });
        if (!user) {
          throw new GraphQLError('No user found with this email address', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if the provided password matches the stored password for the user
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new GraphQLError('Incorrect credentials', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }
  
        const token = signToken(user.username, user.email, user._id);
        return { token, user };
      },

    // Resolver for the 'saveBook' mutation to save a book to a user's account
    saveBook: async (_: any, { bookData }: any, context: { user?: UserDocument }) => {
        if (!context.user) {
          throw new GraphQLError('You need to be logged in!', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }
      // Add the book data to the user's 'savedBooks' array
      return User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: bookData } },
        { new: true, runValidators: true }
      );
    },

    // Resolver for the 'removeBook' mutation to remove a book from a user's
    removeBook: async (_: any, { bookId }: { bookId: string }, context: { user?: UserDocument }) => {
        if (!context.user) {
          throw new GraphQLError('You need to be logged in!', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

      return User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    }
  }
};

export default resolvers;