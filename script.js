/**
 * script.js
 * Lógica do formulário (AJAX Apps Script, integração API polos, ViaCEP, selects compostos).
 *
 * Mantém a lógica original e adiciona:
 * - suporte a opções agrupadas no select de cursos (união de semestres + equipamentos).
 * - "todos" não altera o select de semestres (apenas enviado ao backend).
 */

// *******************************************************************
// CONFIGURE AQUI: URL do Apps Script (Web App)
// *******************************************************************
const appScriptURL = 'https://script.google.com/macros/s/AKfycbzMDyIhd3pwBYUKONtZRVY8dGiicyKBmaldrq0KlxA3F5UMSAf_J46AOwDDzoXTXXr84w/exec';

// URL da API de polos
const API_POLOS_URL = 'https://api-polos.unifecaf.edu.br/api/v1/routine/unidadesativascomsupervisores';

let listaPolos = [];

// Mapeamento dos campos do formulário para chaves da API (mantido)
const mapeamentoCampos = {
    'Email': 'pol_email',
    'Nome do Responsavel pelo Polo': 'pol_coordinator_name',
    'Telefone do Responsavel pelo Polo': 'pol_phone_number',
    'Email do Responsavel pelo Polo': 'pol_coordinator_email',
    'Nome e Numero do Polo': 'pol_name',
    'CEP do Polo': 'pol_postal_code',
    'CNPJ do Polo': 'pol_cnpj',
    'Endereco do Polo': 'pol_address'
};

// -------------------------------------------------------------
// listasEquipamentosPorCursoESemestre
// (mantive o seu object original; se acrescentar keys novas, adicione aqui)
// -------------------------------------------------------------
const listasEquipamentosPorCursoESemestre = {
    /* --- seu conteúdo original copiado aqui --- */
    biomedicina: {
        '1_semestre': [
            "1 Dispenser de álcool 70%", "1 Pia com água corrente", "1 Armário de EPIs",
            "1 Espelho de bancada ou de parede", "1 Lousa ou datashow para instrução teórica inicial",
            "Lixeira de Inox", "Balança de precisão", "Pipetas graduadas ou micropipetas",
            "Béqueres", "Tubos de ensaio"
        ],
        '2_semestre': [
            "3 Pipetas automáticas (100–1000 μL)", "3 Pipetas automáticas (10–100 μL)",
            "1 vórtex", "10 Suporte para tubos de ensaio","5 Buretas graduadas",
            "1 Quadro branco ou datashow para resolução de cálculos em tempo real",
            "1 Modelo sintético do sistema respiratório", "1 Modelo sintético do sistema cardiovascular",
            "1 Modelo sintético do sistema urinário","1 Modelo sintético do sistema digestório",
            "20 Erlenmeyers (250 mL)", "10 Suportes para bureta", "10 Pipetadores","20 Óculos de proteção",
            "10 Espátulas metálicas", "6 Frascos de vidro com tampa (para sais)"
        ],
        '3_semestre': [
            "50 Tubos de ensaios", "10 Pipetas graduadas","3 Termômetros", "1 banho-maria",
            "5 Cronômetros","10 Bastões de vidro","10 Proveta de 50 mL",
            "10 Microscópios ópticos", "1 Glicosímetro digital", "1 Caixa coletora de perfurocortantes (3L)"
        ],
        '4_semestre': ["1 Estetoscópios"],
        '5_semestre': [
            "10 Lâminas histológicas (tecidos epitelial, conjuntivo, muscular, nervoso)",
            "10 Funil","10 Copos medidores", "10 Colheres", "1 Balança Semi-analítica",
            "1 Estufa", "5 Cubas de coloração","10 pinças"
        ],
        '6_semestre': [
            "1 Recipientes para descarte de resíduos biológicos ", "1 Recipientes para descarte de resíduos perfurocortantes ",
            "10 Cálice de sedimentação (fundo cônico)","15 Pipetas pauster","10 paquímetros"
        ],
        '7_semestre': [
            "1 Centrífuga", "5 Câmara de neubauer","5 Esfigmomanômetro aneroide",
            "1 Recipiente para descarte de resíduos químicos", "1 Recipiente para descarte de resíduos biologicos"
        ],
        '8_semestre': [
            "10 (para 10 duplas) Computadores com acesso à internet", "1 Projetor multimídia com tela",
            "1 Quadro branco com pincel", "10 Estabilizador ou nobreak (opcional, recomendado)",
            "Bandejas para manuseio dos materiais simulados", "1 Lixeira para descarte biológico/simulado",
            "2 Balanças de precisão", "10 Beckeres", "5 Termômetros", "1 Banho-maria",
            "10 Agitadores de vidro ", "20 Potes plásticos para amostras","Fitas de pH",
            "1 Caixas para descarte de perfurocortantes", "Modelos sintéticos ou superfícies simuladas"
        ]
    },
    enfermagem: {
        '1_semestre': [
            "Manequins de alta fidelidade", "Leitos hospitalares", "Materiais para curativos",
            "Equipamentos de proteção individual (EPIs)", "Armários para insumos",
            "Pias com torneiras de acionamento por cotovelo ou pedal", "Descarte de perfurocortantes"
        ],
        '2_semestre': [
            "Seringas e agulhas", "Estetoscópios", "Esfigmomanômetros"
        ]
    },
    farmacia: {
        '1_semestre': [
            "1 Dispenser de álcool 70%", "1 Espelho de bancada ou de parede", "1 Lixeira de Inox",
            "20 béqueres","50 Tubos de ensaio","10 Pipeta Graduada"
        ],
        '2_semestre': [
            "10 Pipetas graduadas","10 Pipetadores", "20 Óculos de proteção",
            "1 Modelo sintético do sistema respiratório","1 Modelo sintético do sistema cardiovascular",
            "1 Modelo sintético do sistema digestório", "1 Modelo sintético do sistema urinário",
            "1 Lâminas histológicas", "10 Buretas graduadas (50 mL)", "10 Erlenmeyers (250 mL)",
            "10 Suportes para bureta","10 Pipetadores","20 Óculos de proteção"
        ],
        '3_semestre': [
            "5 Termômetro", "1 Cronômetro","10 Bastões de vidro","10 Proveta de 50 mL",
            "5 Microscópios ópticos", "1 Glicosímetro digital", "1 Caixa coletora de perfurocortantes (3L)","20 Réguas"
        ],
        '4_semestre': ["1 Estetoscópios", "1 Banho-maia"],
        '5_semestre': [
            "5 Cubas de coloração","1 Recipientes para descarte de resíduos biológicos",
            "1 Recipientes para descarte de resíduos perfurocortantes",
            "10 Funil", "10 Buretas", "10 Suportes para bureta","20 Erlenmeyers"
        ],
        '6_semestre': [
            "1 recipientes para descarte de resíduos biológicos",
            "1 recipientes para descarte de resíduos perfurocortantes",
            "15 Cálice de sedimentação (fundo cônico)",
            "15 Pipetas pauster", "10 Paquímetros", "5 Pinças", "1 estufa bacteriológica",
            "1 dispositivo de medição de dureza", "10 Frascos plásticos com tampa (tipo pote de suplemento)",
            "10 placas de vidro", "10 Encapsuladoras manuais", "10 Frascos âmbar"
        ],
        '7_semestre': ["10 Copos medidores", "10 Colheres"],
        '8_semestre': ["Não há requisitos específicos para o 8º semestre"],
        '9_semestre': ["20 Frascos âmbar com conta-gotas (30mL)", "10 bule", "14 Frascos de vidro com tampa"],
        '10_semestre': [
            "1 Recipiente para descarte de resíduos químicos", "1 Recipiente para descarte de resíduos biológicos",
            "5 Frascos simulados de vacina (solução salina)","2 Modelos anatômicos com músculos deltoide"
        ]
    },
    nutricao: {
        '1_semestre': ["não há requisitos específicos para o 1º semestre"],
        '2_semestre': [
            "5 microscópios ópticos", "5 Pinças", "5 Pipetas e suportes",
            "5 Lâminas e lamínulas", "1 Kit Lâminas histológicas didáticas",
            "1 Modelos sintéticos do sistema digestório(tronco humano com órgãos expostos)",
            "1 Modelos sintéticos de coração, pulmões e vias aéreas superiores.","1 Modelos musculares sintéticos (tronco humano ou segmentos corporais).",
            "1 Esqueletos humanos sintéticos com articulações móveis.", "1 Modelos sintéticos tridimensionais do encéfalo, medula espinhal e nervos.",
            "1 Modelos sintéticos do sistema urinário humano em corte frontal e transversal.",
            "5 Fita métrica inelástica", "3 Adipômetros clínicos", "1 Quadro Branco", "2 Canetões", "1 Balança de Biopedância", "2 Estadiômetro"
        ],
        '3_semestre': ["1 Balança pediátrica", "1 Estadiômetro ou infantômetro", "1 Boneco antropométrico"],
        '4_semestre': [
            "1 Balança analítica", "1 Jogo de tubos de ensaio de 30ml", "1 Béquer",
            "1 Funil de vidro", "1 Pipetador", "1 Estante para tubos de ensaio"
        ]
    },
    radiologia: {
        '1_semestre': [
            "1 Dispenser de álcool 70%", "1 Espelho de bancada ou de parede", "1 Lixeira de Inox",
            "1 Esqueleto Humano Padrão de 1,70 Cm C/Suporte, Haste e Rodas",
            "1 Torso de 45cm Bissexual/Assexuado Coluna Exposta 25 partes"
        ],
        '2_semestre': [
            "1 Modelo anatômico do sistema respiratório", "1 Modelo anatômico do sistema cardiovascular",
            "1 Modelo anatômico do sistema digestório", "1 Modelo anatômico do sistema urinário"
        ],
        '3_semestre': ["5 Microscópio óptico", "1 Kit Imobilização Prancha + Imobilizador + Colar Cervical 16 posições"],
        '4_semestre': ["2 Negatoscópios 1 Corpo Em Aço Inox Led Bivolt, Mesa e Parede"],
        '5_semestre': ["2 Esfigmomanômetros aneroides"]
    },
    educacaoFisica: {
        '1_semestre': [
           "10 Cones 15cm", "10 Cordas Curtas", "10 Cordas Longas",
           "2 Cordas longas", "2 Cronômetro", "7 Bolas de voleibol", "2 Bolas de Borracha",
           "20 Tatames m²"
        ],
        '2_semestre': [
            "3 Talas de fixação", "1 Maca de transporte com cinto de fixação",
            "1 Modelo Sintético do sistema cardiovascular", "1 Modelo Sintético do sistema respiratório",
            "1 Modelo Sintético do sistema digestório", "1 Modelo Sintético do sistema urinário",
            "1 Modelo de Anatomia do Torso Humano"
        ],
        '3_semestre': [
            "15 Bastões de Madeira", "7 Bolas de Handebol", "1 Modelo de Estrutura Muscular",
            "1 Modelo Muscular de Anatomia"
        ],
        '4_semestre': [
            "10 Fitas de ginástica", "6 Fitas métricas", "5 Pares Maças (Pares)",
            "10 arcos(bambolês)", "7 Bolas de Basquetebol"
        ],
        '5_semestre': [
            "7 Bolas de futsal", "2 Bolas de futebol", "2 kit com 10 Colchonetes",
            "2 Kit medicine balls", "3 Faixas Elásticas"
        ],
        '6_semestre': [
            "3 Kit Espaguetes Flutuadores", "10 Blocos Flutuadores", "1 Balança de Biopedância",
            "1 Adipômetro", "2 Estadiômetro POrtátil", "1 Balança de Biopedância"
        ],
        '7_semestre': [
            "1 Corda naval", "3 TRX", "2 Barra de Aço 1,8m", "2 Barra de Aço 1,2m"
        ]
    },
    fisioterapia: {
        '1_semestre': [
            "2 Canetões", "2 Tripés", "2 Óculos VR Tipo Google Cardboard",
            "5 Macas", "5 Crôometros", "1 Disperser de álcool 70%"
        ],
        '2_semestre': [
            "1 Modelos Sintéticos do sistema respiratório", "1 Modelo Sintéticos do sistema digestório",
            "1 Modelo muscular sintético", "1 Esqueleto humano sintético com articulações móveis",
            "1 Modelo sintético tridimensional do encéfalo, medula espinhal e nervos",
            "1 Modelo sintético do sistema urinário", "5 fita métrica", "3 Adipômetros",
            "1 Tens e Fes"
        ],
        '3_semestre': [
            "5 Goniômetros", "5 Microscópio ópticos",
            "1 Lâminas histológicas (tecidos epitelial, conjuntivo, muscular, nervoso)",
            "5 Fita adesiva", "1 Pacote de Swabs descartavéis",
            "5 Pipetas automáticas (100–1000 μL )", "5 Pipetas automáticas (10–100 μL)",
            "50 Pipetas pasteur"
        ]
    },
    terapiaOcupacional: {
        '1_semestre': [
            "1 Aparelho de som portátil", "5 Jogos cognitivos simples", "10 Colchonetes",
            "2 Jogos terapêuticos cognitivos", "3 Jogos terapêuticos (tabuleiro/cartas"
        ],
        '2_semestre': ["2 Modelo de braço com músculos destacáveis", "2 Cartazes anatômicos"],
        '3_semestre': [
            "5 Goniômetros", "5 Relógios analógicos",
            "2 Dispositivos de monitorização de sinais vitais(Oximetro)",
            "5 Crinômetros", "2 Pesos (kit com 2 pesinhos)"
        ],
        '4_semestre': ["5 Arcos", "5 Dinamômetro", "5 Bolas Bobath", "5 Cones"],
        '5_semestre': [
            "2 Tesouras", "10 Tecidos", "10 Almofadas", "5 Potes com aromas",
            "5 Elementos visuais", "5 Elementos auditivos"
        ],
        '6_semestre': ["10 Fita metríca"],
        '7_semestre': ["Não há requisitos específicos para o 7º semestre"],
        '8_semestre': ["10 Bolas de borracha macia", "1 Lenços", "1 Toalhas Kit com 10"]
    },
    esteticaCosmetica: {
        '1_semestre': ["1 Dispenser de álcool 70%", "1 Espelho de bancada ou de parede", "1 Lixeira de Inox"],
        '2_semestre': ["1 Balanças antropométricas", "2 Adipômetros", "1 Glicosímetro digital"],
        '3_semestre': ["2 Conjunto de ventosas de silicone"],
        '4_semestre': ["Não há requisitos específicos para o 4º semestre"],
        '5_semestre': [
            "5 Rollers para microagulhamento", "1 Vaporizadores de ozônio", "1 Lupa com Luz de Led",
            "1 Alta Frequência", "1 Aparelho de TENS (Estimulação Elétrica Nervosa Transcutânea)",
            "1 Aparelho de Microcorrente", "1 Aparelho de Ultrassom"
        ]
    },
    arquiteturaEEngenharia: {
        '1_semestre': [
            "6 Prancheta Desenho Portátil Trident A3", "2 Trena fita de açõ 5m",
            "2 Trena Laser", "2 Kit Geométrico Mdf 5 peças - Compasso Esquadro Transferidor",
            "10 Especificações de computador (atende todos os cursos):- Processador: Intel Core i5 10ª geração ou superior ou equivalente AMD Ryzen 5 4000 Series ou superior, Memória RAM: 16 GB, Armazenamento: SSD de 512 GB ou superior, Placa de vídeo dedicada: NVIDIA GTX 1650 4GB ou superior (GTX 1050 Ti no mínimo), Tela: Full HD (1920x1080), 15.6 ou maior, IPS preferencial, Sistema operacional: Windows 10 ou 11"
        ],
        '2_semestre': ["1 Kit de Física - Conjunto Básico para Fisíca Experimental", "Kit de Física - Funções, Gráficos, Erros e Medidas"],
        '3_semestre': [
            "1 kit de Física - Funções, Gráficos, Erros e Medidas",
            "1 kit de Física - Laboratório Didático de Eletricidade",
            "1 Kit Medição, Segurança e Eficiência Energética"
        ],
        '4_semestre': ["1 Impressora 3d Creality Ender 3 V3 Se-1001020508", "1 Manômetro", "2 Mangueira transparente"],
        '5_semestre': [
            "1 kit topografia e Levantamento Planialtimétrico (kit Nivel Óptico Automático 32x + Mira 4m + Tripé Topografia",
            "1 Kit Eletrônica e Circuitos Básicos", "1 Kit Solos"
        ],
        '6_semestre': ["1 kit instalações Elétricas e Projetos Prediais", "1 Kit Concretagem", "1 Colher de pedreiro", "1 Balde plástico", "1 Martelo de Borracha"],
        '7_semestre': ["1 Kit Máquinas Elétricas e Acionamentos"],
        '8_semestre': ["1 Kit Automação, CLP e Programação", "1 Kit Logística e Cadeia de Suprimentos", "1 Kit Kit Qualidade e Produtividade"]
    },
    pedagogia: {
        '1_semestre': [
            "1 Material Dourado (Completo)", "1 Escala Cuisenaire", "1 Blocos Lógicos",
            "1 Dominó de Fração", "1 Dominó de Multiplicação", "1 Dominó de Alfabetização em Libras",
            "1 Dominó de Alfabetização", "1 Ábaco de Madeira", "1 Jogos de Tabuleiro",
            "1 Letras Móveis", "1 Jogo da Memória", "1 Caixa de Giz de Cera",
            "1 Caixa de Lápis de Color", "1 Resma de Folhas Coloridas", "1 Caixa de Tesouras",
            "1 Caixa de Colas com 12 unidades", "4 Caixa de Guaches com 6 unidades", "2 Kit de 12 Pincéis"
        ]
    },
    marketing: { 'Todos os Semestres': ["1 Computador com acesso à internet", "1 Sala de Aula"] },
    GestaoRecursosHumanos: { 'Todos os Semestres': ["1 Computador com acesso à internet", "1 Sala de Aula"] },
    logistica: { 'Todos os Semestres': ["1 Computador com acesso à internet", "1 Sala de Aula"] },
    gestaoComercial: { 'Todos os Semestres': ["1 Computador com acesso à internet", "1 Sala de Aula"] },
    gestaoFinanceira: { 'Todos os Semestres': ["1 Computador com acesso à internet", "1 Sala de Aula"] },
    cienciasContabeis: { 'Todos os Semestres': ["1 Computador com acesso à internet", "1 Sala de Aula"] },
    GestaoDaTecnologiaDaInformacao: { 'Todos os Semestres': ["1 Computador com acesso à internet", "1 Sala de Aula"] },
    CienciaDaComputacao: { 'Todos os Semestres': ["1 Computador com acesso à internet", "1 Sala de Aula"] },
    AnaliseEDesenvolvimentoDeSistemas: { 'Todos os Semestres': ["1 Computador com acesso à internet", "1 Sala de Aula"] }
};

// -------------------------------------------------------------
// Mapeamento de opções do select para keys do objeto acima.
// Atualize aqui caso altere os value do select no HTML.
// -------------------------------------------------------------
const opcaoParaKeys = {
    arquiteturaEEngenharias: ['arquiteturaEEngenharia'], // note: key existente no objeto
    'biomedicina|farmacia': ['biomedicina', 'farmacia'],
    educacaoFisica: ['educacaoFisica'],
    esteticaCosmetica: ['esteticaCosmetica'],
    'fisioterapia|terapiaOcupacional': ['fisioterapia', 'terapiaOcupacional'],
    nutricao: ['nutricao'],
    'radiologia|servicoSocial': ['radiologia', 'servicoSocial'], // 'servicoSocial' só será usado se existir nessa lista
    'pedagogia|psicopedagogia': ['pedagogia', 'psicopedagogia'],
    todos: [] // será substituída dinamicamente
};

// preencher 'todos' com todas as keys existentes
opcaoParaKeys.todos = Object.keys(listasEquipamentosPorCursoESemestre);

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function formatarNomeSemestre(semestreKey) {
    if (!semestreKey) return '';
    const partes = semestreKey.split('_');
    if (partes.length === 2 && partes[1].toLowerCase().includes('semestre')) {
        const num = parseInt(partes[0]);
        if (!isNaN(num)) return `${num}º Semestre`;
    }
    // fallback
    return semestreKey.charAt(0).toUpperCase() + semestreKey.slice(1);
}

function unirArraysUnicos(arrays) {
    const set = new Set();
    arrays.forEach(arr => {
        if (Array.isArray(arr)) arr.forEach(item => set.add(item));
    });
    return Array.from(set);
}

function obterKeysDoValorSelect(valor) {
    if (!valor) return [];
    const keys = opcaoParaKeys[valor] || [];
    // Filtra apenas keys que realmente existam na estrutura de dados
    return keys.filter(k => listasEquipamentosPorCursoESemestre.hasOwnProperty(k));
}

// -------------------------------------------------------------
// popularEquipamentos: agora combina as listas de várias keys sem duplicação
// -------------------------------------------------------------
function popularEquipamentos(cursoValue, semestreKey) {
    const equipamentosListaContainer = document.getElementById('equipamentosListaContainer');
    if (!equipamentosListaContainer) return;

    equipamentosListaContainer.innerHTML = '';
    equipamentosListaContainer.style.display = 'none';

    if (!cursoValue || !semestreKey) return;

    const keys = obterKeysDoValorSelect(cursoValue);
    if (keys.length === 0) return;

    // coletar listas do semestre de cada key
    const equipamentosCombinados = [];
    keys.forEach(k => {
        const mapCurso = listasEquipamentosPorCursoESemestre[k] || {};
        const lista = mapCurso[semestreKey] || [];
        if (Array.isArray(lista)) equipamentosCombinados.push(...lista);
    });

    if (equipamentosCombinados.length === 0) {
        equipamentosListaContainer.innerHTML = `<p>Sem requisitos específicos ou dados não disponíveis para o semestre selecionado.</p>`;
        equipamentosListaContainer.style.display = 'block';
        return;
    }

    const unicos = Array.from(new Set(equipamentosCombinados));

    let html = `<details class="equipamentos-details"><summary>Visualizar Lista Completa de Equipamentos - ${formatarNomeSemestre(semestreKey)}</summary><ol>`;
    unicos.forEach(item => html += `<li>${item}</li>`);
    html += `</ol></details>`;

    equipamentosListaContainer.innerHTML = html;
    equipamentosListaContainer.style.display = 'block';
}

// -------------------------------------------------------------
// popularSemestres: se cursoValue === 'todos' -> NÃO altera semestres (comportamento pedido).
// Se curso for agrupado, mostra a união de semestres das keys existentes (ignorando chaves 'Todos...' )
// -------------------------------------------------------------
function popularSemestres(cursoValue) {
    const selecionarSemestre = document.getElementById('selecionarSemestre');
    const semestreEquipamentosContainer = document.getElementById('semestreEquipamentosContainer');
    if (!selecionarSemestre || !semestreEquipamentosContainer) return;

    // comportamento solicitado: se selecionar "todos", não mexer no select de semestres
    if (cursoValue === 'todos') {
        return;
    }

    // reset básico
    selecionarSemestre.innerHTML = '<option value="">Selecione o Semestre</option>';
    semestreEquipamentosContainer.style.display = 'none';
    popularEquipamentos('', '');

    if (!cursoValue) {
        return;
    }

    const keys = obterKeysDoValorSelect(cursoValue);
    if (keys.length === 0) {
        selecionarSemestre.innerHTML = '<option value="">Sem requisitos específicos</option>';
        selecionarSemestre.disabled = true;
        return;
    }

    // coletar semestres de cada key, removendo chaves que contenham 'todos'
    const semestresArrays = keys.map(k => Object.keys(listasEquipamentosPorCursoESemestre[k] || {}).filter(s => !s.toLowerCase().includes('todos')));
    const semestres = unirArraysUnicos(semestresArrays);

    if (semestres.length === 0) {
        selecionarSemestre.innerHTML = '<option value="">Sem requisitos específicos</option>';
        selecionarSemestre.disabled = true;
        return;
    }

    // ordenar semestres numericamente quando possível
    semestres.sort((a,b) => {
        const na = parseInt(a);
        const nb = parseInt(b);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        if (!isNaN(na)) return -1;
        if (!isNaN(nb)) return 1;
        return a.localeCompare(b);
    });

    semestres.forEach(s => {
        const option = document.createElement('option');
        option.value = s;
        option.textContent = formatarNomeSemestre(s);
        selecionarSemestre.appendChild(option);
    });

    selecionarSemestre.disabled = false;
    semestreEquipamentosContainer.style.display = 'block';
}

// -------------------------------------------------------------
// Mostrar/ocultar blocos estáticos por curso (mantido)
// -------------------------------------------------------------
function mostrarListaRequisitosPorCurso(cursoSelecionado) {
    document.querySelectorAll('.lista-requisitos').forEach(lista => {
        lista.style.display = 'none';
    });

    if (cursoSelecionado) {
        const id = `lista${cursoSelecionado.charAt(0).toUpperCase() + cursoSelecionado.slice(1)}`;
        const listaParaMostrar = document.getElementById(id);
        if (listaParaMostrar) listaParaMostrar.style.display = 'block';
    }
}

// -------------------------------------------------------------
// Inicialização DOMContentLoaded (mantive a maior parte do seu fluxo original)
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    const estruturaPropriaRadio = document.getElementById('estruturaPropria');
    const estruturaParceriaRadio = document.getElementById('estruturaParceria');
    const selectPolo = document.getElementById('selecionarPolo');
    const carregandoPolosMsg = document.getElementById('carregandoPolos');
    const erroCarregamentoPolosMsg = document.getElementById('erroCarregamentoPolos');
    const selectCurso = document.getElementById('selecionarCurso');
    const selecionarSemestre = document.getElementById('selecionarSemestre');

    const inputCep = document.getElementById('CEP_do_Polo');
    const inputEndereco = document.getElementById('Endereco_do_Polo');

    function toggleParceriaFields() {
        const parceriaFields = document.getElementById('parceriaFields');
        const linkContratoInput = document.getElementById('Link_Contrato_de_Parceria');
        if (!parceriaFields || !linkContratoInput) return;
        if (estruturaParceriaRadio && estruturaParceriaRadio.checked) {
            parceriaFields.style.display = 'block';
            linkContratoInput.setAttribute('required', 'required');
        } else {
            parceriaFields.style.display = 'none';
            linkContratoInput.removeAttribute('required');
            linkContratoInput.value = '';
        }
    }

    if (estruturaPropriaRadio && estruturaParceriaRadio) {
        estruturaPropriaRadio.addEventListener('change', toggleParceriaFields);
        estruturaParceriaRadio.addEventListener('change', toggleParceriaFields);
    }
    toggleParceriaFields();

    if (selectCurso) {
        selectCurso.addEventListener('change', function() {
            const val = this.value;
            mostrarListaRequisitosPorCurso(val);
            // se val === 'todos' -> não altera semestres (comportamento pedido)
            popularSemestres(val);
        });
    }

    if (selecionarSemestre) {
        selecionarSemestre.addEventListener('change', function() {
            const cursoSelecionado = selectCurso ? selectCurso.value : '';
            popularEquipamentos(cursoSelecionado, this.value);
        });
    }

    // --- Carregar polos (mantido do original) ---
    async function carregarPolos() {
        if (selectPolo) {
            selectPolo.disabled = true;
            selectPolo.innerHTML = '<option value="">Carregando...</option>';
        }
        if (carregandoPolosMsg) carregandoPolosMsg.style.display = 'block';
        if (erroCarregamentoPolosMsg) erroCarregamentoPolosMsg.style.display = 'none';

        try {
            const response = await fetch(API_POLOS_URL);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            const rawData = await response.json();
            const data = Array.isArray(rawData) ? rawData[0] : rawData;
            if (!Array.isArray(data)) throw new Error('Formato de dados inesperado da API (esperava array).');

            listaPolos = data;

            if (selectPolo) {
                selectPolo.innerHTML = '<option value="">-- Selecione um Polo --</option>';
                listaPolos.forEach((polo) => {
                    if (polo.pol_name && polo.pol_mentor_id_reference) {
                        const option = document.createElement('option');
                        option.value = polo.pol_mentor_id_reference;
                        option.textContent = polo.pol_name;
                        selectPolo.appendChild(option);
                    }
                });
                selectPolo.disabled = false;
            }

            if (carregandoPolosMsg) carregandoPolosMsg.style.display = 'none';
        } catch (err) {
            console.error('Erro ao carregar polos:', err);
            if (carregandoPolosMsg) carregandoPolosMsg.style.display = 'none';
            if (erroCarregamentoPolosMsg) {
                erroCarregamentoPolosMsg.textContent = 'Erro ao carregar polos: ' + err.message;
                erroCarregamentoPolosMsg.style.display = 'block';
            }
            if (selectPolo) {
                selectPolo.innerHTML = '<option value="">Não foi possível carregar os polos</option>';
                selectPolo.disabled = true;
            }
        }
    }
    carregarPolos();

    // --- Preenchimento ao selecionar polo (mantido) ---
    if (selectPolo) {
        selectPolo.addEventListener('change', function() {
            const poloIdSelecionado = this.value;
            const poloSelecionado = listaPolos.find(p => p.pol_mentor_id_reference == poloIdSelecionado);
            if (poloSelecionado) {
                document.getElementById('Email').value = poloSelecionado[mapeamentoCampos['Email']] || '';
                document.getElementById('Nome_do_Responsavel_pelo_Polo').value = poloSelecionado[mapeamentoCampos['Nome do Responsavel pelo Polo']] || '';
                document.getElementById('Telefone_do_Responsavel_pelo_Polo').value = poloSelecionado[mapeamentoCampos['Telefone do Responsavel pelo Polo']] || '';
                document.getElementById('Email_do_Responsavel_pelo_Polo').value = poloSelecionado[mapeamentoCampos['Email do Responsavel pelo Polo']] || '';
                document.getElementById('Nome_e_Numero_do_Polo').value = poloSelecionado[mapeamentoCampos['Nome e Numero do Polo']] || '';
                document.getElementById('CEP_do_Polo').value = poloSelecionado[mapeamentoCampos['CEP do Polo']] || '';
                document.getElementById('CNPJ_do_Polo').value = poloSelecionado[mapeamentoCampos['CNPJ do Polo']] || '';
                let enderecoCompletoPelaApi = poloSelecionado[mapeamentoCampos['Endereco do Polo']] || '';
                if (poloSelecionado.pol_address_number) enderecoCompletoPelaApi += ', ' + poloSelecionado.pol_address_number;
                if (poloSelecionado.pol_address_complement) enderecoCompletoPelaApi += ' - ' + poloSelecionado.pol_address_complement;
                if (poloSelecionado.pol_district) enderecoCompletoPelaApi += ', ' + poloSelecionado.pol_district;
                if (poloSelecionado.pol_city) enderecoCompletoPelaApi += ' - ' + poloSelecionado.pol_city;
                if (poloSelecionado.pol_state) enderecoCompletoPelaApi += '/' + poloSelecionado.pol_state;
                document.getElementById('Endereco_do_Polo').value = enderecoCompletoPelaApi;

                if (document.getElementById('CEP_do_Polo').value && enderecoCompletoPelaApi.trim().length < 10) {
                    document.getElementById('CEP_do_Polo').dispatchEvent(new Event('blur'));
                }
            } else {
                ['Email','Nome_do_Responsavel_pelo_Polo','Telefone_do_Responsavel_pelo_Polo','Email_do_Responsavel_pelo_Polo','Nome_e_Numero_do_Polo','CEP_do_Polo','CNPJ_do_Polo','Endereco_do_Polo'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
            }
        });
    }

    // ViaCEP (mantido)
    if (inputCep) {
        inputCep.addEventListener('blur', async function() {
            let cep = this.value.replace(/\D/g, '');
            if (cep.length != 8) return;
            if (!inputEndereco) return;
            inputEndereco.value = 'Buscando...';
            try {
                const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await resp.json();
                if (!("erro" in data)) {
                    inputEndereco.value = `${data.logradouro || ''}${data.logradouro ? ', ' : ''}${data.complemento || ''} - ${data.bairro || ''}, ${data.localidade || ''} - ${data.uf || ''}`;
                } else {
                    inputEndereco.value = '';
                    alert("CEP não encontrado.");
                }
            } catch (err) {
                console.error('Erro ao buscar CEP:', err);
                inputEndereco.value = '';
                alert("Erro ao buscar CEP. Tente novamente.");
            }
        });
    }

}); // fim DOMContentLoaded

// -------------------------------------------------------------
// Envio do formulário (mantido)
// -------------------------------------------------------------
document.getElementById('myForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const feedbackMessage = document.getElementById('feedbackMessage');

    feedbackMessage.textContent = '';
    feedbackMessage.className = '';
    feedbackMessage.style.display = 'none';

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
        const response = await fetch(appScriptURL, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.text();
            feedbackMessage.textContent = "Dados enviados com sucesso! " + data;
            feedbackMessage.className = 'success';
            form.reset();

            // restaurar estados padrão
            const parceriaFields = document.getElementById('parceriaFields');
            if (parceriaFields) parceriaFields.style.display = 'none';
            const linkContratoInput = document.getElementById('Link_Contrato_de_Parceria');
            if (linkContratoInput) linkContratoInput.removeAttribute('required');

            const selectPolo = document.getElementById('selecionarPolo');
            if (selectPolo) {
                selectPolo.value = '';
                selectPolo.dispatchEvent(new Event('change'));
            }

            const selectCurso = document.getElementById('selecionarCurso');
            if (selectCurso) {
                selectCurso.value = '';
                // limpar semestres para padrão
                const selecionarSemestre = document.getElementById('selecionarSemestre');
                if (selecionarSemestre) {
                    selecionarSemestre.innerHTML = '<option value="">Selecione o Semestre</option>';
                    selecionarSemestre.disabled = true;
                    const equipamentosListaContainer = document.getElementById('equipamentosListaContainer');
                    if (equipamentosListaContainer) equipamentosListaContainer.style.display = 'none';
                }
            }
        } else {
            const errorText = await response.text();
            throw new Error(`Erro ao enviar dados. Status: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        feedbackMessage.textContent = "Erro ao enviar os dados: " + error.message;
        feedbackMessage.className = 'error';
        console.error('Erro:', error);
    } finally {
        feedbackMessage.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar Cadastro do Polo';
    }
});
