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
        // First, check if this authentication already exists using raw query
        const authResults = await prisma.$queryRaw`
          SELECT a.*, u.* FROM auth a
          JOIN users u ON a.userId = u.id
          WHERE a.provider = 'google' AND a.providerId = ${profile.id}
          LIMIT 1
        `;
        
        // If auth exists, return the associated user
        if (Array.isArray(authResults) && authResults.length > 0) {
          const auth = authResults[0];
          const now = new Date();
          
          // Update last used date
          await prisma.$executeRaw`
            UPDATE auth 
            SET lastUsedAt = ${now}
            WHERE id = ${auth.id}
          `;
          
          // Extract user data from joined result
          const user = {
            id: auth.userId,
            firstName: auth.firstName,
            lastName: auth.lastName,
            email: auth.email,
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
          // Create new auth entry for this user using raw query
          const now = new Date();
          const avatar = profile.photos?.[0]?.value || null;
          
          try {
            // Check if avatar column exists
            const columnCheck = await prisma.$queryRaw`SHOW COLUMNS FROM auth LIKE 'avatar'`;
            const avatarExists = Array.isArray(columnCheck) && columnCheck.length > 0;
            
            if (avatarExists) {
              // Use query with avatar column
              await prisma.$executeRaw`
                INSERT INTO auth (provider, providerId, userId, avatar, createdAt, lastUsedAt)
                VALUES ('google', ${profile.id}, ${existingUser.id}, ${avatar}, ${now}, ${now})
              `;
            } else {
              // Use query without avatar column
              console.warn('Avatar column not found, creating auth record without avatar');
              await prisma.$executeRaw`
                INSERT INTO auth (provider, providerId, userId, createdAt, lastUsedAt)
                VALUES ('google', ${profile.id}, ${existingUser.id}, ${now}, ${now})
              `;
            }
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
          
          // Then create the auth entry separately with avatar
          if (newUser && newUser.id) {
            const now = new Date();
            await prisma.$executeRaw`
              INSERT INTO auth (provider, providerId, userId, avatar, createdAt, lastUsedAt)
              VALUES ('google', ${profile.id}, ${newUser.id}, ${avatar}, ${now}, ${now})
            `;
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
        // First, check if this authentication already exists using raw query
        const authResults = await prisma.$queryRaw`
          SELECT a.*, u.* FROM auth a
          JOIN users u ON a.userId = u.id
          WHERE a.provider = 'github' AND a.providerId = ${profile.id}
          LIMIT 1
        `;
        
        // If auth exists, return the associated user
        if (Array.isArray(authResults) && authResults.length > 0) {
          const auth = authResults[0];
          const now = new Date();
          
          // Update last used date
          await prisma.$executeRaw`
            UPDATE auth 
            SET lastUsedAt = ${now}
            WHERE id = ${auth.id}
          `;
          
          // Extract user data from joined result
          const user = {
            id: auth.userId,
            firstName: auth.firstName,
            lastName: auth.lastName,
            email: auth.email,
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
          // Create new auth entry for this user using raw query
          // First check if avatar column exists
          const now = new Date();
          const avatar = profile.photos?.[0]?.value || null;
          
          try {
            // Check if avatar column exists
            const columnCheck = await prisma.$queryRaw`SHOW COLUMNS FROM auth LIKE 'avatar'`;
            const avatarExists = Array.isArray(columnCheck) && columnCheck.length > 0;
            
            if (avatarExists) {
              // Use query with avatar column
              await prisma.$executeRaw`
                INSERT INTO auth (provider, providerId, userId, avatar, createdAt, lastUsedAt)
                VALUES ('github', ${profile.id}, ${existingUser.id}, ${avatar}, ${now}, ${now})
              `;
            } else {
              // Use query without avatar column
              console.warn('Avatar column not found, creating auth record without avatar');
              await prisma.$executeRaw`
                INSERT INTO auth (provider, providerId, userId, createdAt, lastUsedAt)
                VALUES ('github', ${profile.id}, ${existingUser.id}, ${now}, ${now})
              `;
            }
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
          
          // Then create the auth entry separately with avatar
          if (newUser && newUser.id) {
            const now = new Date();
            await prisma.$executeRaw`
              INSERT INTO auth (provider, providerId, userId, avatar, createdAt, lastUsedAt)
              VALUES ('github', ${profile.id}, ${newUser.id}, ${avatar}, ${now}, ${now})
            `;
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
