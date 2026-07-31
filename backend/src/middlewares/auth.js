import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError('Token não fornecido', 401));
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
    return next(new AppError('Token inválido', 401));
  }

  const token = parts[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Token expirado. Faça login novamente.', 401));
      }
      return next(new AppError('Token inválido', 401));
    }
    req.user = decoded;
    return next();
  });
};

const isAdminMiddleware = (req, res, next) => {
  if (!req.user || req.user.tipo !== 'admin') {
    return next(new AppError('Acesso negado. Apenas administradores', 403));
  }
  next();
};

const isGestorOrAdminMiddleware = (req, res, next) => {
  if (!req.user || (req.user.tipo !== 'admin' && req.user.tipo !== 'gestor')) {
    return next(new AppError('Acesso negado. Apenas gestores ou administradores', 403));
  }
  next();
};

export {
  authMiddleware,
  isAdminMiddleware,
  isGestorOrAdminMiddleware
};
