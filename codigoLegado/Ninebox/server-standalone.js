const express = require('express');
const cors = require('cors');
const path = require('path');
const { mockUsers, mockAvaliacoes, mockAvaliados, mockGestores, mockCompetencias, mockRespostas } = require('./mock-data');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Servir arquivos estáticos da raiz
app.use(express.static(__dirname));

// Usar dados mock
let users = [...mockUsers];
let avaliacoes = [...mockAvaliacoes];
let avaliados = [...mockAvaliados];
let gestores = [...mockGestores];
let competencias = [...mockCompetencias];
let respostas = [...mockRespostas];

console.log('Dados mock carregados:');
console.log('- Usuários:', users.length);
console.log('- Avaliações:', avaliacoes.length);
console.log('- Avaliados:', avaliados.length);
console.log('- Gestores:', gestores.length);
console.log('- Competências:', competencias.length);
console.log('- Respostas:', respostas.length);

// Login admin
app.post('/login', (req, res) => {
  console.log('POST /login - Body:', req.body);
  const { email, password, accessType } = req.body;
  const user = users.find(u => u.email === email && u.senha === password);
  
  if (user && accessType === 'admin') {
    console.log('Login bem-sucedido para:', user.nome);
    res.json({ 
      message: 'Login bem-sucedido', 
      tipo: user.tipo, 
      token: 'mock-token-' + Date.now() 
    });
  } else {
    console.log('Login falhou');
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

// Login usuário (CPF)
app.post('/loginUsuario', (req, res) => {
  const { cpf, tipoCargo } = req.body;
  const user = users.find(u => u.cpf === cpf && u.tipo === tipoCargo);
  
  if (user) {
    res.json({ 
      message: 'Login bem-sucedido', 
      tipo: user.tipo, 
      token: 'mock-token-' + Date.now() 
    });
  } else {
    res.status(401).json({ message: 'Usuário não encontrado' });
  }
});

// Verificar token
app.get('/verificaToken', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && token.startsWith('mock-token-')) {
    res.json({ valid: true, tipo: 'admin' });
  } else {
    res.status(401).json({ valid: false });
  }
});

// Listar avaliações
app.post('/listarAvaliacoes', (req, res) => {
  res.json({ avaliacoes });
});

app.post('/listarAvaliacoesGestor', (req, res) => {
  res.json({ avaliacoes });
});

// GET /avaliacoes para compatibilidade
app.get('/avaliacoes', (req, res) => {
  res.json({ avaliacoes });
});

// Adicionar avaliação
app.post('/adicionarAvaliacao', (req, res) => {
  const novaAvaliacao = { id: Date.now(), ...req.body };
  avaliacoes.push(novaAvaliacao);
  res.json({ message: 'Avaliação adicionada', id: novaAvaliacao.id });
});

// Avaliados
app.get('/avaliado', (req, res) => {
  res.json(avaliados);
});

app.post('/avaliado', (req, res) => {
  const novoAvaliado = { id: Date.now(), ...req.body };
  avaliados.push(novoAvaliado);
  res.json({ message: 'Avaliado adicionado', id: novoAvaliado.id });
});

app.put('/editarAvaliado/:cpf', (req, res) => {
  const { cpf } = req.params;
  const index = avaliados.findIndex(a => a.cpf === cpf);
  if (index !== -1) {
    avaliados[index] = { ...avaliados[index], ...req.body };
    res.json({ message: 'Avaliado atualizado' });
  } else {
    res.status(404).json({ message: 'Avaliado não encontrado' });
  }
});

// Gestores
app.get('/gestor', (req, res) => {
  res.json(gestores);
});

app.post('/gestor', (req, res) => {
  const novoGestor = { id: Date.now(), ...req.body };
  gestores.push(novoGestor);
  res.json({ message: 'Gestor adicionado', id: novoGestor.id });
});

// Competências
app.get('/competencias', (req, res) => {
  res.json(competencias);
});

app.post('/salvar_competencia', (req, res) => {
  const novaCompetencia = { id: Date.now(), ...req.body };
  competencias.push(novaCompetencia);
  res.json({ message: 'Competência salva', id: novaCompetencia.id });
});

app.post('/competenciaPoridAvaliacao', (req, res) => {
  const { idAvaliacao } = req.body;
  const comps = competencias.filter(c => c.idAvaliacao === idAvaliacao);
  res.json(comps);
});

app.post('/competenciaPoridAvaliacaoGestor', (req, res) => {
  const { idAvaliacao } = req.body;
  const comps = competencias.filter(c => c.idAvaliacao === idAvaliacao);
  res.json(comps);
});

app.post('/descricaoPoridAvaliacao', (req, res) => {
  const { idAvaliacao } = req.body;
  const avaliacao = avaliacoes.find(a => a.id === idAvaliacao);
  res.json({ descricao: avaliacao?.descricao || '' });
});

app.post('/descricaoPoridAvaliacaoGestor', (req, res) => {
  const { idAvaliacao } = req.body;
  const avaliacao = avaliacoes.find(a => a.id === idAvaliacao);
  res.json({ descricao: avaliacao?.descricao || '' });
});

// Respostas
app.post('/salvarResposta', (req, res) => {
  const novaResposta = { id: Date.now(), ...req.body };
  respostas.push(novaResposta);
  res.json({ message: 'Resposta salva' });
});

app.post('/salvarRespostaGestor', (req, res) => {
  const novaResposta = { id: Date.now(), ...req.body };
  respostas.push(novaResposta);
  res.json({ message: 'Resposta salva' });
});

// Avaliados por avaliação
app.post('/avaliadosPoridAvaliacaoGestor', (req, res) => {
  const { idAvaliacao } = req.body;
  const avaliadosDaAvaliacao = avaliados.filter(a => a.idAvaliacao === idAvaliacao);
  res.json(avaliadosDaAvaliacao);
});

// Buscar avaliação por ID
app.get('/avaliacoes/:id', (req, res) => {
  const avaliacao = avaliacoes.find(a => a.id === parseInt(req.params.id));
  if (avaliacao) {
    res.json(avaliacao);
  } else {
    res.status(404).json({ message: 'Avaliação não encontrada' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor legado rodando em http://localhost:${PORT}`);
});
