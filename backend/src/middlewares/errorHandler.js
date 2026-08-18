const PRISMA_FIELD_LABELS = {
  email: 'e-mail',
  ra: 'RA',
  nome: 'nome',
  cpf: 'CPF',
};

function fieldLabel(field) {
  return PRISMA_FIELD_LABELS[field] || field;
}

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development' || err.statusCode >= 500) {
    console.error('[ERROR]', err.message, err.stack?.split('\n').slice(0,3).join(' | '));
  }

  // Erros operacionais (AppError lançado pelo código)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // P2002 — Unique constraint (campo duplicado)
  if (err.code === 'P2002') {
    const raw = err.meta?.target;
    const fields = Array.isArray(raw) ? raw : [raw || 'campo'];
    const label = fieldLabel(fields[0]);
    return res.status(400).json({
      success: false,
      message: `${label.charAt(0).toUpperCase() + label.slice(1)} já cadastrado. Use outro valor.`,
      field: fields[0],
    });
  }

  // P2003 — Foreign key constraint
  if (err.code === 'P2003') {
    const field = err.meta?.field_name || 'referência';
    return res.status(400).json({
      success: false,
      message: `Referência inválida: o ${fieldLabel(field.replace('_id', ''))} informado não existe.`,
    });
  }

  // P2014 — Relation violation
  if (err.code === 'P2014') {
    return res.status(400).json({
      success: false,
      message: 'Operação inválida: existem registros relacionados que impedem esta ação.',
    });
  }

  // P2025 — Record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro não encontrado.',
    });
  }

  // Erro de validação Joi (via middleware validate.js)
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: err.details[0].message,
      errors: err.details.map(d => d.message),
    });
  }

  // Erro genérico — não expor detalhes internos
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor. Tente novamente mais tarde.',
  });
};

export { errorHandler };
