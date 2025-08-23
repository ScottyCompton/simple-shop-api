// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import prisma from '../services/prismaService.js';
import { User, Auth } from '../models/types.js';
import { ExtendedUser, PrismaAuth } from '../types/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

// Configure Google Strategy with improved error handling
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
      scope: ['profile', 'email'],
      // Add state parameter for CSRF protection
      state: true,
      // Add proxy config for handling proxied requests
      proxy: true,
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // First, check if this authentication already exists using Prisma
        const existingAuth = await prisma.auth.findFirst({
          where: {
            provider: 'google',
            providerId: profile.id.toString()
          },
          include: {
            user: true
          }
        });
        
        // If auth exists, return the associated user
        if (existingAuth && existingAuth.user) {
          // Get new avatar from profile
          const newAvatar = profile.photos?.[0]?.value || null;
          
          // Update last used date and avatar if needed
          const updateData: { lastUsedAt: Date; avatar?: string | null } = {
            lastUsedAt: new Date()
          };
          
          // If current avatar is null and we have a new one, update it
          if (existingAuth.avatar === null && newAvatar) {
            updateData.avatar = newAvatar;
            console.log(`Updating Google avatar for user ${existingAuth.userId} from null to ${newAvatar}`);
          }
          
          // Update the auth record
          await prisma.auth.update({
            where: { id: existingAuth.id },
            data: updateData
          });
          
          // Extract user data from the related user
          const user = {
            id: existingAuth.user.id,
            firstName: existingAuth.user.firstName,
            lastName: existingAuth.user.lastName,
            email: existingAuth.user.email,
            // ...other fields
          };
          
          return done(null, user);
        }
        
        // If no auth record exists, check if user exists by email
        let existingUser = null;
        
        if (profile.emails && profile.emails[0]?.value) {
          existingUser = await prisma.user.findFirst({
            where: {
              email: profile.emails[0].value
            }
          });
        }

        // If user exists but hasn't connected with this provider yet
        if (existingUser) {
          // Create new auth entry for this user using Prisma client
          const avatar = profile.photos?.[0]?.value || null;
          
          try {
            // Directly use Prisma to create the auth record with avatar
            await prisma.auth.create({
              data: {
                provider: 'google',
                providerId: profile.id.toString(),
                avatar: avatar,
                userId: existingUser.id,
                // createdAt and lastUsedAt will use default(now())
              }
            });
          } catch (error) {
            console.error('Error creating auth record:', error);
            throw error;
          }
          
          return done(null, existingUser);
        }

        // If user doesn't exist, create a new one
        if (profile.emails && profile.emails.length > 0) {
          const email = profile.emails[0].value;
          const nameParts = (profile.displayName || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
          const avatar = profile.photos?.[0]?.value || null;
          
          // First create the user without auth
          const newUser = await prisma.user.create({
            data: {
              firstName,
              lastName,
              email,
              // Default billing information
              billingFirstName: firstName,
              billingLastName: lastName,
              billingAddress1: '',
              billingCity: '',
              billingState: '',
              billingZip: '',
              billingPhone: '',
              // Default shipping information
              shippingFirstName: firstName,
              shippingLastName: lastName,
              shippingAddress1: '',
              shippingCity: '',
              shippingState: '',
              shippingZip: '',
              shippingPhone: ''
            }
          });
          
          // Then create the auth entry separately with avatar using Prisma client
          if (newUser && newUser.id) {
            await prisma.auth.create({
              data: {
                provider: 'google',
                providerId: profile.id.toString(),
                avatar: avatar,
                userId: newUser.id,
                // createdAt and lastUsedAt will use default(now())
              }
            });
          }
          
          return done(null, newUser);
        }
        
        return done(null, false);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Configure GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: `${process.env.API_URL}/api/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // First, check if this authentication already exists using Prisma
        const existingAuth = await prisma.auth.findFirst({
          where: {
            provider: 'github',
            providerId: profile.id.toString()
          },
          include: {
            user: true
          }
        });
        
        // If auth exists, return the associated user
        if (existingAuth && existingAuth.user) {
          // Get new avatar from profile
          const newAvatar = profile.photos?.[0]?.value || null;
          
          // Update last used date and avatar if needed
          const updateData: { lastUsedAt: Date; avatar?: string | null } = {
            lastUsedAt: new Date()
          };
          
          // If current avatar is null and we have a new one, update it
          if (existingAuth.avatar === null && newAvatar) {
            updateData.avatar = newAvatar;
            console.log(`Updating GitHub avatar for user ${existingAuth.userId} from null to ${newAvatar}`);
          }
          
          // Update the auth record
          await prisma.auth.update({
            where: { id: existingAuth.id },
            data: updateData
          });
          
          // Extract user data from the related user
          const user = {
            id: existingAuth.user.id,
            firstName: existingAuth.user.firstName,
            lastName: existingAuth.user.lastName,
            email: existingAuth.user.email,
            // ...other fields
          };
          
          return done(null, user);
        }
        
        // If no auth record exists, check if user exists by email
        let existingUser = null;
        
        if (profile.emails && profile.emails[0]?.value) {
          existingUser = await prisma.user.findFirst({
            where: {
              email: profile.emails[0].value
            }
          });
        }

        // If user exists but hasn't connected with this provider yet
        if (existingUser) {
          // Create new auth entry for this user using Prisma client
          const avatar = profile.photos?.[0]?.value || null;
          
          try {
            // Directly use Prisma to create the auth record with avatar
            await prisma.auth.create({
              data: {
                provider: 'github',
                providerId: profile.id.toString(),
                avatar: avatar,
                userId: existingUser.id,
                // createdAt and lastUsedAt will use default(now())
              }
            });
          } catch (error) {
            console.error('Error creating auth record:', error);
            throw error;
          }
          
          return done(null, existingUser);
        }

        // If user doesn't exist, create a new one
        if (profile.emails && profile.emails.length > 0) {
          const email = profile.emails[0].value;
          const nameParts = (profile.displayName || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
          const avatar = profile.photos?.[0]?.value || null;
          
          // First create the user without auth
          const newUser = await prisma.user.create({
            data: {
              firstName,
              lastName,
              email,
              // Default billing information
              billingFirstName: firstName,
              billingLastName: lastName,
              billingAddress1: '',
              billingCity: '',
              billingState: '',
              billingZip: '',
              billingPhone: '',
              // Default shipping information
              shippingFirstName: firstName,
              shippingLastName: lastName,
              shippingAddress1: '',
              shippingCity: '',
              shippingState: '',
              shippingZip: '',
              shippingPhone: ''
            }
          });
          
          // Then create the auth entry separately with avatar using Prisma client
          if (newUser && newUser.id) {
            await prisma.auth.create({
              data: {
                provider: 'github',
                providerId: profile.id.toString(),
                avatar: avatar,
                userId: newUser.id,
                // createdAt and lastUsedAt will use default(now())
              }
            });
          }
          
          return done(null, newUser);
        }
        
        return done(null, false);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
