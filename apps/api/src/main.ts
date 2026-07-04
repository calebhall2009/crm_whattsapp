// ─────────────────────────────────────────────────────────────
// NestJS Application Entry Point
// ─────────────────────────────────────────────────────────────

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  // rawBody: true preserves the unparsed request body so webhook signature
  // verifiers (e.g. Stripe) can validate against the original payload.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // ── Security ────────────────────────────────────────────────
  app.use(helmet());
  app.use(cookieParser());

  // CORS — restricted to our own domains only
  const corsOrigins = process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:3001",
  ];
  app.enableCors({
    origin: corsOrigins,
    credentials: true, // Allow cookies (Clerk __session)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // ── Validation ──────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  // ── Start ───────────────────────────────────────────────────
  const port = process.env.PORT || process.env.API_PORT || 4000;
  await app.listen(port, "0.0.0.0");
  console.log(`🚀 API running on port ${port} (bound to 0.0.0.0)`);
}

bootstrap();
