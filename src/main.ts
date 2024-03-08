import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const whitelist = [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:8081',
    'http://noephilippe.freeboxos.fr:8000',
    'http://noephilippe.freeboxos.fr:3000',
    'http://10.135.129.143:8081',
    'https://backoffice.cocon-animal.fr',
    'https://api.cocon-animal.fr',
    'https://www.cocon-animal.fr',
    'https://cocon-animal.fr',
    'https://www.api.cocon-animal.fr',
    'https://www.backoffice.cocon-animal.fr',
  ];
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });
  // app.enableCors({
  //   origin: '*',
  // });
  await app.listen(process.env.API_PORT || 8000);
}
bootstrap();
