import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trust proxy for Render (and other reverse proxies)
  app.setGlobalPrefix('api');
  const isProduction = process.env.NODE_ENV === 'production';
  
  // CORS configuration for production
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    // Render frontend URLs
    'https://time-tracking-frontend.onrender.com',
    'https://time-tracking.onrender.com',
  ].filter(Boolean);

  app.enableCors({
    origin: isProduction 
      ? allowedOrigins 
      : (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
          // In development, allow any localhost origin
          if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
          }
          callback(new Error('Not allowed by CORS'));
        },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    maxAge: 86400, // 24 hours
  });

  // Security headers
  app.use((req: any, res: any, next: () => void) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
