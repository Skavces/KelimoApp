import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import passport from 'passport';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 5001;

  app.set('trust proxy', 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev_session_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true,
        sameSite: 'none',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();
