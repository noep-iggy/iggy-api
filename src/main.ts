import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Autorise toutes les origines, vous pouvez spécifier des origines spécifiques au besoin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Méthodes HTTP autorisées
    allowedHeaders: 'Content-Type,Authorization', // En-têtes autorisés
    exposedHeaders: 'Content-Length, X-Request-ID', // En-têtes exposés
    credentials: true, // Autorise l'envoi de cookies avec la requête (pour les requêtes avec credentials)
    maxAge: 600, // Temps de mise en cache (en secondes) de la pré-vérification (preflight)
  });
  await app.listen(process.env.API_PORT || 8000);
}
bootstrap();
