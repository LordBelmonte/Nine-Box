-- Update nine_box_categorias to use B1-B3, M1-M3, A1-A3 nomenclature
-- This is a data update migration (not schema change)

-- Update each category with the new codes and names
UPDATE "nine_box_categorias" SET
    codigo = 'B1',
    nome = 'B1 - Insuficiente',
    tipo = 'Insuficiente',
    perfil = 'Potencial baixo e desempenho abaixo do esperado',
    "planoAcao" = 'Identificar obstáculos que impedem o desempenho adequado. Caso não haja melhoria após suporte e desenvolvimento, considerar realocação ou desligamento.',
    icon = 'fa-circle-xmark',
    cor = '#ef4444'
WHERE codigo = 'Q1';

UPDATE "nine_box_categorias" SET
    codigo = 'B2',
    nome = 'B2 - Eficaz',
    tipo = 'Eficaz',
    perfil = 'Potencial baixo e desempenho dentro do esperado',
    "planoAcao" = 'Profissionais consistentes que cumprem suas responsabilidades. Manter motivação através de reconhecimento e compensação adequada.',
    icon = 'fa-check',
    cor = '#22c55e'
WHERE codigo = 'Q2';

UPDATE "nine_box_categorias" SET
    codigo = 'B3',
    nome = 'B3 - Comprometido',
    tipo = 'Comprometido',
    perfil = 'Potencial baixo e desempenho acima do esperado',
    "planoAcao" = 'Colaboradores leais e dedicados que superam expectativas. Recompensar com bônus e benefícios, mas sem expectativa de crescimento hierárquico.',
    icon = 'fa-star',
    cor = '#10b981'
WHERE codigo = 'Q3';

UPDATE "nine_box_categorias" SET
    codigo = 'M1',
    nome = 'M1 - Questionável',
    tipo = 'Questionável',
    perfil = 'Potencial mediano e desempenho abaixo do esperado',
    "planoAcao" = 'Identificar causas do baixo desempenho. Fornecer mentoria, treinamento e definir plano de desenvolvimento com metas claras.',
    icon = 'fa-question-circle',
    cor = '#f59e0b'
WHERE codigo = 'Q4';

UPDATE "nine_box_categorias" SET
    codigo = 'M2',
    nome = 'M2 - Mantenedor',
    tipo = 'Mantenedor',
    perfil = 'Potencial e desempenho em nível mediano',
    "planoAcao" = 'Profissionais sólidos que mantêm o fluxo de trabalho. Oferecer projetos desafiadores e oportunidades de desenvolvimento para evitar estagnação.',
    icon = 'fa-minus-circle',
    cor = '#3b82f6'
WHERE codigo = 'Q5';

UPDATE "nine_box_categorias" SET
    codigo = 'M3',
    nome = 'M3 - Forte Desempenho',
    tipo = 'Forte Desempenho',
    perfil = 'Potencial mediano e desempenho acima do esperado',
    "planoAcao" = 'Desenvolver habilidades de liderança e pensamento estratégico. Preparar para assumir mais responsabilidades e projetos complexos.',
    icon = 'fa-arrow-up',
    cor = '#8b5cf6'
WHERE codigo = 'Q6';

UPDATE "nine_box_categorias" SET
    codigo = 'A1',
    nome = 'A1 - Enigma',
    tipo = 'Enigma',
    perfil = 'Alto potencial e desempenho abaixo do esperado',
    "planoAcao" = 'Profissionais com grande potencial que não estão entregando. Investigar causas: desalinhamento de função, falta de suporte, questões pessoais.',
    icon = 'fa-puzzle-piece',
    cor = '#f97316'
WHERE codigo = 'Q7';

UPDATE "nine_box_categorias" SET
    codigo = 'A2',
    nome = 'A2 - Em crescimento',
    tipo = 'Em crescimento',
    perfil = 'Alto potencial e desempenho dentro do esperado',
    "planoAcao" = 'Colaboradores em ascensão que respondem bem a desafios. Oferecer projetos estratégicos, mentoria executiva e plano de carreira claro.',
    icon = 'fa-seedling',
    cor = '#06b6d4'
WHERE codigo = 'Q8';

UPDATE "nine_box_categorias" SET
    codigo = 'A3',
    nome = 'A3 - Destaque',
    tipo = 'Destaque',
    perfil = 'Alto potencial e desempenho acima do esperado',
    "planoAcao" = 'Talentos excepcionais prontos para promoções. Desenvolver como futuros líderes, oferecer oportunidades de liderança de projetos e mentoria de pares.',
    icon = 'fa-crown',
    cor = '#eab308'
WHERE codigo = 'Q9';