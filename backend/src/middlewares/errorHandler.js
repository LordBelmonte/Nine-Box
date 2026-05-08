const errorHandler = (err, req, res, next) => {
  // Log apenas em desenvolvimento ou erros críticos
  if (process.env.NODE_ENV === 'development' || err.statusCode >= 500) {
    console.error('Erro:', err);
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Erro do Prisma - Unique constraint
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'campo';
    return res.status(400).json({
      success: false,
      message: `Já existe um registro com esse ${field}`,
      errors: [`${field} já está em uso`]
    });
  }

  // Erro do Prisma - Record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro não encontrado',
      errors: ['O registro solicitado não existe']
    });
  }

  // Erro de validação Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: err.details.map(d => d.message)
    });
  }

  // Erro genérico
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    errors: ['Ocorreu um erro inesperado. Tente novamente mais tarde.']
  });
};

export { errorHandler };
