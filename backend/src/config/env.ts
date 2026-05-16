import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: `${process.env.MONGODB_URI}/smart_leads_dashboard` || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;
