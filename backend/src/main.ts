import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

type CorsCallback = (error: Error | null, allow?: boolean) => void;

function allowedOrigins() {
  const raw = process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? "";
  const fromEnv = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const defaults = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5176",
    "http://localhost:5176",
  ];
  return Array.from(new Set([...defaults, ...fromEnv]));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = allowedOrigins();
  const allowAllInDev = process.env.NODE_ENV !== "production";
  app.enableCors({
    origin: (origin: string | undefined, callback: CorsCallback) => {
      if (allowAllInDev || !origin || origins.includes(origin) || origins.includes("*")) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origem não permitida no CORS: ${origin}`), false);
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? "0.0.0.0";
  await app.listen(port, host);
  console.log(`BureauFlow API em http://${host}:${port}`);
  console.log(`CORS habilitado para: ${origins.join(", ")}`);
}

bootstrap();