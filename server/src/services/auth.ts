import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Define an interface for JWT payload structure
export interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

// Function to authenticate and verify JWT token. 
export const authenticateToken = (token: string) => {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY || '';
    const user = jwt.verify(token, secretKey) as JwtPayload;
    return user;
  } catch (err) {
    throw new Error('Invalid token');
  }
};

// Function to sign and generate JWT token
export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';
  return jwt.sign(payload, secretKey, { expiresIn: '2h' });
};