// =============================================
// VALIDATORS.JS — Validações reutilizáveis
// =============================================

/** E-mail institucional .edu.br */
export function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.br$/i.test(email.trim());
}

/** RA: 5 a 10 caracteres */
export function isValidRA(ra) {
  const t = ra.trim();
  return t.length >= 5 && t.length <= 10;
}

/** Nome: mínimo 3 caracteres */
export function isValidNome(nome) {
  return nome.trim().length >= 3;
}

/** Senha: mínimo 6 caracteres */
export function isValidSenha(senha) {
  return senha.length >= 6;
}

/** Comentário: mínimo 20 caracteres */
export function isValidComentario(texto) {
  return texto.trim().length >= 20;
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

/**
 * Exibe mensagem de erro inline abaixo de um campo.
 * @param {string} fieldId - ID do input/select
 * @param {string} msg     - Mensagem (vazio para limpar)
 */
export function setFieldError(fieldId, msg) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  // Remove erro anterior
  const prev = field.parentElement.querySelector('.field-error');
  if (prev) prev.remove();
  field.classList.remove('field-invalid');

  if (msg) {
    field.classList.add('field-invalid');
    const span = document.createElement('span');
    span.className = 'field-error';
    span.setAttribute('role', 'alert');
    span.textContent = msg;
    field.parentElement.appendChild(span);
  }
}

/**
 * Limpa todos os erros de um formulário.
 * @param {string} formId - ID do form ou container
 */
export function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  form.querySelectorAll('.field-invalid').forEach(el => el.classList.remove('field-invalid'));
}

// ─── Formulário de Cadastro ───────────────────────────────────────────────────

/**
 * Valida o formulário de cadastro de usuário.
 * Exibe mensagens específicas para cada campo.
 * Retorna true se válido.
 * @param {{ ra, nome, email, senha, tipo, cargo, departamento, gestorId }} fields
 */
export function validateCadastroForm({ ra, nome, email, senha, tipo, cargo, departamento, gestorId }) {
  let valid = true;

  // RA
  if (!ra || !ra.trim()) {
    setFieldError('cad-ra', 'RA é obrigatório.');
    valid = false;
  } else if (!isValidRA(ra)) {
    setFieldError('cad-ra', 'RA inválido. Use entre 5 e 10 caracteres.');
    valid = false;
  } else {
    setFieldError('cad-ra', '');
  }

  // Nome
  if (!nome || !nome.trim()) {
    setFieldError('cad-nome', 'Nome é obrigatório.');
    valid = false;
  } else if (!isValidNome(nome)) {
    setFieldError('cad-nome', 'Nome muito curto. Use pelo menos 3 caracteres.');
    valid = false;
  } else {
    setFieldError('cad-nome', '');
  }

  // E-mail
  if (!email || !email.trim()) {
    setFieldError('cad-email', 'E-mail é obrigatório.');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('cad-email', 'E-mail inválido. Verifique o formato.');
    valid = false;
  } else if (!isValidEmail(email)) {
    setFieldError('cad-email', 'E-mail institucional obrigatório. Use seu e-mail com domínio .edu.br.');
    valid = false;
  } else {
    setFieldError('cad-email', '');
  }

  // Senha
  if (!senha) {
    setFieldError('cad-senha', 'Senha é obrigatória.');
    valid = false;
  } else if (!isValidSenha(senha)) {
    setFieldError('cad-senha', 'Senha muito curta. Use pelo menos 6 caracteres.');
    valid = false;
  } else {
    setFieldError('cad-senha', '');
  }

  // Tipo
  if (!tipo) {
    setFieldError('cad-tipo', 'Tipo de usuário é obrigatório.');
    valid = false;
  } else {
    setFieldError('cad-tipo', '');
  }

  // Cargo (obrigatório)
  if (!cargo || !cargo.trim()) {
    setFieldError('cad-cargo', 'Cargo é obrigatório.');
    valid = false;
  } else {
    setFieldError('cad-cargo', '');
  }

  // Departamento (obrigatório)
  if (!departamento || !departamento.trim()) {
    setFieldError('cad-departamento', 'Departamento é obrigatório.');
    valid = false;
  } else {
    setFieldError('cad-departamento', '');
  }

  // Gestor (obrigatório para colaborador)
  if (tipo === 'colaborador') {
    if (!gestorId) {
      setFieldError('cad-gestor', 'Gestor responsável é obrigatório para colaboradores.');
      valid = false;
    } else {
      setFieldError('cad-gestor', '');
    }
  }

  return valid;
}

// ─── Formulário de Edição ─────────────────────────────────────────────────────

/**
 * Valida o formulário de edição de usuário.
 * @param {{ nome, email, cargo, departamento, tipo, gestorId }} fields
 * @param {boolean} isColaborador
 */
export function validateEdicaoForm({ nome, email, cargo, departamento, tipo, gestorId }, isColaborador = false) {
  let valid = true;

  if (!nome || !nome.trim()) {
    setFieldError('edit-nome', 'Nome é obrigatório.');
    valid = false;
  } else if (!isValidNome(nome)) {
    setFieldError('edit-nome', 'Nome muito curto. Use pelo menos 3 caracteres.');
    valid = false;
  } else {
    setFieldError('edit-nome', '');
  }

  if (!email || !email.trim()) {
    setFieldError('edit-email', 'E-mail é obrigatório.');
    valid = false;
  } else if (!isValidEmail(email)) {
    setFieldError('edit-email', 'E-mail institucional inválido. Use domínio .edu.br.');
    valid = false;
  } else {
    setFieldError('edit-email', '');
  }

  if (!cargo || !cargo.trim()) {
    setFieldError('edit-cargo', 'Cargo é obrigatório.');
    valid = false;
  } else {
    setFieldError('edit-cargo', '');
  }

  if (!departamento) {
    setFieldError('edit-departamento', 'Departamento é obrigatório.');
    valid = false;
  } else {
    setFieldError('edit-departamento', '');
  }

  return valid;
}

// ─── Formulário de Login ──────────────────────────────────────────────────────

export function validateLoginForm({ email, senha }) {
  let valid = true;

  if (!email || !email.trim()) {
    setFieldError('login-email', 'E-mail é obrigatório.');
    valid = false;
  } else if (!isValidEmail(email)) {
    setFieldError('login-email', 'E-mail institucional obrigatório (domínio .edu.br).');
    valid = false;
  } else {
    setFieldError('login-email', '');
  }

  if (!senha) {
    setFieldError('login-senha', 'Senha é obrigatória.');
    valid = false;
  } else {
    setFieldError('login-senha', '');
  }

  return valid;
}
