// middleware/gatewayAuth.js
import { Request, Response, NextFunction } from "express";

const gatewayAuth = (req: Request, res: Response, next: NextFunction) => {
  // 1. Definir o segredo (deve vir do teu ficheiro .env)
  const INTERNAL_SECRET = process.env.GATEWAY_INTERNAL_SECRET;

  // 2. Rota de Health Check costuma ser exceção para o Docker monitorizar
  if (req.path === "/health") {
    return next();
  }

  // 3. Capturar o header que o Gateway envia
  const incomingSecret = req.headers["x-gateway-secret"];

  // 4. Validação
  if (!incomingSecret || incomingSecret !== INTERNAL_SECRET) {
    console.warn(`[SECURITY] Acesso bloqueado! IP: ${req.ip} - Host: ${req.headers.host}`);

    return res.status(403).json({
      error: "forbidden",
      message: "Direct access not allowed. Please use the API Gateway.",
    });
  }

  // Se estiver tudo bem, continua para a rota
  next();
};

export default gatewayAuth;
