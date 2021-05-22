import { NextFunction, Request, Response } from 'express';

const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timeStamp = new Date().toISOString();
  const start = new Date().getTime();
  res.on('finish', () => {
    const elapsed = new Date().getTime() - start;
    console.info(
      `[${timeStamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${elapsed}ms`
    );
  });
  next();
};

export default requestLogger;
