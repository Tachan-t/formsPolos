/**
 * @file Lógica de envio do formulário para o Google Apps Script, interatividade e integração com API de polos.
 * @author Parceiro de Programacao
 */

// *******************************************************************
// IMPORTANTE: COLOQUE O URL DO APLICATIVO DA WEB DO SEU APPS SCRIPT AQUI!
// Você obteve este URL no Passo 3 da configuração do Apps Script.
// Exemplo: 'https://script.google.com/macros/s/AKfycBx.../exec'
// *******************************************************************
const appScriptURL = 'https://script.google.com/macros/s/AKfycbxG9_8_zZQYxCKYlDUIrom3s2XZMqd5kKAZ5UrWMBtkbOBRIP02f6TXkFSroruLWFKv6A/exec'; 

// URL da API de polos
const API_POLOS_URL = 'https://api-polos.unifecaf.edu.br/api/v1/routine/polosativoscomsupervisores';

let listaPolos = []; // Para armazenar os dados dos polos da API

// Mapeamento dos campos do formulário para as chaves da API
const mapeamentoCampos = {
    'Email': 'pol_email', 
    'Nome do Responsavel pelo Polo': 'pol_coordinator_name', 
    'Telefone do Responsavel pelo Polo': 'pol_phone_number', 
    'Email do Responsavel pelo Polo': 'pol_coordinator_email', // Adicionado/Confirmado aqui para o novo campo HTML
    'Nome e Numero do Polo': 'pol_name', 
    'CEP do Polo': 'pol_postal_code', 
    'CNPJ do Polo': 'pol_cnpj', 
    'Endereco do Polo': 'pol_address' 
};


// Função para lidar com a exibição/ocultação do campo de parceria
function toggleParceriaFields() {
    const parceriaFields = document.getElementById('parceriaFields');
    const linkContratoInput = document.getElementById('Link_Contrato_de_Parceria'); 
    const estruturaParceriaRadio = document.getElementById('estruturaParceria'); 

    if (estruturaParceriaRadio.checked) {
        parceriaFields.style.display = 'block';
        linkContratoInput.setAttribute('required', 'required');
    } else {
        parceriaFields.style.display = 'none';
        linkContratoInput.removeAttribute('required');
        linkContratoInput.value = ''; 
    }
}

// Objeto que armazena as listas de equipamentos por curso e semestre
// Você precisará preencher TODAS AS LISTAS para cada curso e semestre.
const listasEquipamentosPorCursoESemestre = {
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
        '4_semestre': [
            "1 Estetoscópios"
        ],
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
        ],
    },
    enfermagem: {
        '1_semestre': [
            "Manequins de alta fidelidade", "Leitos hospitalares", "Materiais para curativos",
            "Equipamentos de proteção individual (EPIs)", "Armários para insumos",
            "Pias com torneiras de acionamento por cotovelo ou pedal", "Descarte de perfurocortantes"
        ],
        '2_semestre': [
            "Seringas e agulhas", "Estetoscópios", "Esfigmomanômetros"
        ],
    },
    farmacia: {
        '1_semestre': [
            "1 Dispenser de álcool 70%", "1 Espelho de bancada ou de parede", "1 Lixeira de Inox", 
            "20 béqueres","50 Tubos de ensaio"," 10 Pipeta Graduada"
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
        '4_semestre': [
            "1 Estetoscópios", "1 Banho-maia"
        ],
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
        '7_semestre': [
            "10 Copos medidores", "10 Colheres"
        ],
        '8_semestre': [
            "Não há requisitos específicos para o 8º semestre"
        ],
        "9_semestre": [
            "20 Frascos âmbar com conta-gotas (30mL)", "10 bule", "14 Frascos de vidro com tampa"
        ],
        '10_semestre': [
            "1 Recipiente para descarte de resíduos químicos", "1 Recipiente para descarte de resíduos biológicos",
            "5 Frascos simulados de vacina (solução salina)","2 Modelos anatômicos com músculos deltoide"
        ],
    },
    nutricao: {
        '1_semestre': [
            "não há requisitos específicos para o 1º semestre"
        ],
        '2_semestre': [
            "5 microscópios ópticos", "5 Pinças", "5 Pipetas e suportes",
            "5 Lâminas e lamínulas", "1 Kit Lâminas histológicas didáticas",
            "1 Modelos sintéticos do sistema digestório(tronco humano com órgãos expostos)",
            "1 Modelos sintéticos de coração, pulmões e vias aéreas superiores.","1 Modelos musculares sintéticos (tronco humano ou segmentos corporais).",
            "1 Esqueletos humanos sintéticos com articulações móveis.", "1 Modelos sintéticos tridimensionais do encéfalo, medula espinhal e nervos.",
            "1 Modelos sintéticos do sistema urinário humano em corte frontal e transversal.",
            "5 Fita métrica inelástica", "3 Adipômetros clínicos", "1 Quadro Branco", "2 Canetões", "1 Balança de Biopedância", "2 Estadiômetro"
        ],
        '3_semestre': [
            "1 Balança pediátrica", "1 Estadiômetro ou infantômetro", "1 Boneco antropométrico"
        ],
        '4_semestre': [
            "1 Balança analítica", "1 Jogo de tubos de ensaio de 30ml", "1 Béquer",
            "1 Funil de vidro", "1 Pipetador", "1 Estante para tubos de ensaio"
        ],
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
        '3_semestre': [
            "5 Microscópio óptico", "1 Kit Imobilização Prancha + Imobilizador + Colar Cervical 16 posições"
        ],
        '4_semestre': [
            "2 Negatoscópios 1 Corpo Em Aço Inox Led Bivolt, Mesa e Parede"
        ],
        '5_semestre': [
            "2 Esfigmomanômetros aneroides"
        ],
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
        "4_semestre": [
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
        ],
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
        '3_semestre':[
            "5 Goniômetros", "5 Microscópio ópticos",
            "1 Lâminas histológicas (tecidos epitelial, conjuntivo, muscular, nervoso)",
            "5 Fita adesiva", "1 Pacote de Swabs descartavéis",
            "5 Pipetas automáticas (100–1000 μL )", "5 Pipetas automáticas (10–100 μL)",
            "50 Pipetas pasteur"
        ],
    },
    terapiaOcupacional: {
        '1_semestre': [
            "1 Aparelho de som portátil", "5 Jogos cognitivos simples", "10 Colchonetes",
            "2 Jogos terapêuticos cognitivos", "3 Jogos terapêuticos (tabuleiro/cartas"
        ],
        '2_semestre': [
           "2 Modelo de braço com músculos destacáveis", "2 Cartazes anatômicos"
        ],
        '3_semestre': [
            "5 Goniômetros", "5 Relógios analógicos",
            "2 Dispositivos de monitorização de sinais vitais(Oximetro)",
            "5 Crinômetros", "2 Pesos (kit com 2 pesinhos)"
        ],
        '4_semestre': [
            "5 Arcos", "5 Dinamômetro", "5 Bolas Bobath", "5 Cones"
        ],
        '5_semestre': [
            "2 Tesouras", "10 Tecidos", "10 Almofadas", "5 Potes com aromas",
            "5 Elementos visuais", "5 Elementos auditivos"
        ],
        '6_semestre': [
            "10 Fita metríca"
        ],
        '7_semestre': [
            "Não há requisitos específicos para o 7º semestre"
        ],
        '8_semestre': [
            "10 Bolas de borracha macia", "1 Lenços", "1 Toalhas Kit com 10"
        ],
    },
    esteticaCosmetica: {
        '1_semestre': [
            "1 Dispenser de álcool 70%", "1 Espelho de bancada ou de parede", "1 Lixeira de Inox"
        ],
        '2_semestre': [
            "1 Balanças antropométricas", "2 Adipômetros", "1 Glicosímetro digital"
        ],
        '3_semestre': [
            "2 Conjunto de ventosas de silicone"
        ],
        '4_semestre': [
            "Não há requisitos específicos para o 4º semestre"
        ],
        "5_semestre": [
            "5 Rollers para microagulhamento", "1 Vaporizadores de ozônio", "1 Lupa com Luz de Led",
            "1 Alta Frequência", "1 Aparelho de TENS (Estimulação Elétrica Nervosa Transcutânea)",
            "1 Aparelho de Microcorrente", "1 Aparelho de Ultrassom"
        ],
    },
    arquiteturaEEngenharia: {
        '1_semestre': [
            "6 Prancheta Desenho Portátil Trident A3", "2 Trena fita de açõ 5m",
            "2 Trena Laser", "2 Kit Geométrico Mdf 5 peças - Compasso Esquadro Transferidor",
            "10 Especificações de computador (atende todos os cursos):- Processador: Intel Core i5 10ª geração ou superior ou equivalente AMD Ryzen 5 4000 Series ou superior, Memória RAM: 16 GB, Armazenamento: SSD de 512 GB ou superior, Placa de vídeo dedicada: NVIDIA GTX 1650 4GB ou superior (GTX 1050 Ti no mínimo), Tela: Full HD (1920x1080), 15.6 ou maior, IPS preferencial, Sistema operacional: Windows 10 ou 11"
        ],
        '2_semestre': [
            "1 Kit de Física - Conjunto Básico para Fisíca Experimental",
            "Kit de Física - Funções, Gráficos, Erros e Medidas"
        ],
        '3_semestre': [
            "1 kit de Física - Funções, Gráficos, Erros e Medidas",
            "1 kit de Física - Laboratório Didático de Eletricidade",
            "1 Kit Medição, Segurança e Eficiência Energética"
        ],
        '4_semestre': [
            "1 Impressora 3d Creality Ender 3 V3 Se-1001020508", "1 Manômetro", "2 Mangueira transparente"
        ],
        '5_semestre': [
            "1 kit topografia e Levantamento Planialtimétrico (kit Nivel Óptico Automático 32x + Mira 4m + Tripé Topografia",
            "1 Kit Eletrônica e Circuitos Básicos", "1 Kit Solos"
        ],
        '6_semestre': [
            "1 kit instalações Elétricas e Projetos Prediais", "1 Kit Concretagem", "1 Colher de pedreiro",
            "1 Balde plástico", "1 Martelo de Borracha"
        ],
        '7_semestre': [
            "1 Kit Máquinas Elétricas e Acionamentos"
        ],
        '8_semestre': [
            "1 Kit Automação, CLP e Programação", "1 Kit Logística e Cadeia de Suprimentos", "1 Kit Kit Qualidade e Produtividade"
        ],
    },
    pedagogia: {
        '1_semestre': [
            "1 Material Dourado (Completo)", "1 Escala Cuisenaire", "1 Blocos Lógicos",
            "1 Dominó de Fração", "1 Dominó de Multiplicação", "1 Dominó de Alfabetização em Libras",
            "1 Dominó de Alfabetização", "1 Ábaco de Madeira", "1 Jogos de Tabuleiro",
            "1 Letras Móveis", "1 Jogo da Memória", "1 Caixa de Giz de Cera",
            "1 Caixa de Lápis de Color", "1 Resma de Folhas Coloridas", "1 Caixa de Tesouras",
            "1 Caixa de Colas com 12 unidades", "4 Caixa de Guaches com 6 unidades", "2 Kit de 12 Pincéis"
        ],
    }
};

// FUNÇÃO AUXILIAR PARA FORMATAR NOME DO SEMESTRE
function formatarNomeSemestre(semestreKey) {
    if (!semestreKey) return '';
    const partes = semestreKey.split('_');
    if (partes.length === 2 && partes[1] === 'semestre') {
        return `${partes[0]}º Semestre`; 
    }
    return semestreKey; 
}

// Função para popular a lista de equipamentos (details/summary)
function popularEquipamentos(curso, semestre) {
    const equipamentosListaContainer = document.getElementById('equipamentosListaContainer');
    
    equipamentosListaContainer.innerHTML = '';
    equipamentosListaContainer.style.display = 'none'; 

    if (curso && semestre && listasEquipamentosPorCursoESemestre[curso] && listasEquipamentosPorCursoESemestre[curso][semestre]) {
        const equipamentosDoCursoESemestre = listasEquipamentosPorCursoESemestre[curso][semestre];
        
        let htmlContent = `
            <details class="equipamentos-details">
                <summary>Visualizar Lista Completa de Equipamentos para ${curso.charAt(0).toUpperCase() + curso.slice(1)} - ${formatarNomeSemestre(semestre)}</summary>
                <ol>
        `;
        equipamentosDoCursoESemestre.forEach(equipamento => {
            htmlContent += `<li>${equipamento}</li>`;
        });
        htmlContent += `
                </ol>
            </details>
        `;
        
        equipamentosListaContainer.innerHTML = htmlContent;
        equipamentosListaContainer.style.display = 'block';
    }
}

// Função para popular o select de semestres
function popularSemestres(curso) {
    const selecionarSemestre = document.getElementById('selecionarSemestre');
    const semestreEquipamentosContainer = document.getElementById('semestreEquipamentosContainer'); 
    
    selecionarSemestre.innerHTML = '<option value="">Selecione o Semestre</option>';
    
    semestreEquipamentosContainer.style.display = 'none';
    popularEquipamentos('', ''); 

    if (curso && listasEquipamentosPorCursoESemestre[curso]) {
        const semestresDisponiveis = Object.keys(listasEquipamentosPorCursoESemestre[curso]);
        
        semestresDisponiveis.forEach(semestre => {
            const option = document.createElement('option');
            option.value = semestre;
            option.textContent = formatarNomeSemestre(semestre);
            selecionarSemestre.appendChild(option);
        });
        
        semestreEquipamentosContainer.style.display = 'block';
    }
}

// Função para mostrar/esconder as listas de requisitos por curso
function mostrarListaRequisitosPorCurso(cursoSelecionado) {
    document.querySelectorAll('.lista-requisitos').forEach(lista => {
        lista.style.display = 'none';
    });

    if (cursoSelecionado) {
        const listaParaMostrar = document.getElementById(`lista${cursoSelecionado.charAt(0).toUpperCase() + cursoSelecionado.slice(1)}`);
        if (listaParaMostrar) {
            listaParaMostrar.style.display = 'block';
        }
    }
}


document.addEventListener('DOMContentLoaded', async function() {
    const estruturaPropriaRadio = document.getElementById('estruturaPropria');
    const estruturaParceriaRadio = document.getElementById('estruturaParceria');
    const selectPolo = document.getElementById('selecionarPolo');
    const carregandoPolosMsg = document.getElementById('carregandoPolos');
    const erroCarregamentoPolosMsg = document.getElementById('erroCarregamentoPolos');
    const selectCurso = document.getElementById('selecionarCurso');
    const selecionarSemestre = document.getElementById('selecionarSemestre'); 

    // Referências aos campos do CEP e Endereço
    const inputCep = document.getElementById('CEP_do_Polo');
    const inputEndereco = document.getElementById('Endereco_do_Polo');

    estruturaPropriaRadio.addEventListener('change', toggleParceriaFields);
    estruturaParceriaRadio.addEventListener('change', toggleParceriaFields);
    toggleParceriaFields();

    selectCurso.addEventListener('change', function() {
        mostrarListaRequisitosPorCurso(this.value); 
        popularSemestres(this.value); 
    });

    selecionarSemestre.addEventListener('change', function() {
        const cursoSelecionado = selectCurso.value; 
        popularEquipamentos(cursoSelecionado, this.value); 
    });


    // --- Carregamento e Preenchimento dos Polos da API ---
    async function carregarPolos() {
        console.log('Tentando carregar polos da API...');
        try {
            const response = await fetch(API_POLOS_URL);
            console.log('Resposta da API recebida:', response);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            const rawData = await response.json(); 
            console.log('Dados da API (RAW JSON):', rawData); 
            
            // A API retorna um array onde o primeiro elemento é o array de polos.
            const data = rawData[0]; 
            console.log('Dados da API (Polos extraídos - array de objetos):', data); 
            
            if (!Array.isArray(data)) { 
                console.error('Erro: O primeiro elemento da resposta da API não é um array de polos. Verifique a estrutura da API.');
                erroCarregamentoPolosMsg.textContent = 'Erro: Formato de dados inesperado da API (esperava array de polos).';
                erroCarregamentoPolosMsg.style.display = 'block';
                selectPolo.innerHTML = '<option value="">Não foi possível carregar os polos</option>';
                selectPolo.disabled = true;
                return; 
            }

            listaPolos = data; 

            if (listaPolos.length === 0) {
                selectPolo.innerHTML = '<option value="">Nenhum polo ativo encontrado.</option>';
                console.warn('API retornou uma lista vazia de polos.');
            } else {
                selectPolo.innerHTML = '<option value="">-- Selecione um Polo --</option>'; 
                listaPolos.forEach((polo, index) => {
                    // Verifique se os campos essenciais para a option existem
                    if (polo.pol_name && polo.pol_mentor_id_reference) { 
                        const option = document.createElement('option');
                        option.value = polo.pol_mentor_id_reference; // Usando o ID de referência para o valor
                        option.textContent = polo.pol_name; // Usando o nome do polo para o texto visível
                        selectPolo.appendChild(option);
                    } else {
                        console.warn(`Polo ${index} ignorado: faltando 'pol_name' ou 'pol_mentor_id_reference'.`, polo);
                    }
                });
            }

            carregandoPolosMsg.style.display = 'none'; 
            erroCarregamentoPolosMsg.style.display = 'none'; 
            selectPolo.disabled = false; 
        } catch (error) {
            console.error('Erro ao carregar polos da API:', error);
            carregandoPolosMsg.style.display = 'none';
            erroCarregamentoPolosMsg.textContent = 'Erro ao carregar polos: ' + error.message;
            erroCarregamentoPolosMsg.style.display = 'block'; 
            selectPolo.innerHTML = '<option value="">Não foi possível carregar os polos</option>';
            selectPolo.disabled = true; 
        }
    }

    carregarPolos();

    // --- Lógica de pré-preenchimento ao selecionar um polo ---
    selectPolo.addEventListener('change', function() {
        const poloIdSelecionado = this.value;
        // Encontra o objeto polo correspondente ao ID selecionado
        const poloSelecionado = listaPolos.find(polo => polo.pol_mentor_id_reference == poloIdSelecionado);

        if (poloSelecionado) {
            console.log('Polo selecionado para preencher:', poloSelecionado); 

            // Preenche os campos de contato
            document.getElementById('Email').value = poloSelecionado[mapeamentoCampos['Email']] || '';
            document.getElementById('Nome_do_Responsavel_pelo_Polo').value = poloSelecionado[mapeamentoCampos['Nome do Responsavel pelo Polo']] || '';
            document.getElementById('Telefone_do_Responsavel_pelo_Polo').value = poloSelecionado[mapeamentoCampos['Telefone do Responsavel pelo Polo']] || '';
            document.getElementById('Email_do_Responsavel_pelo_Polo').value = poloSelecionado[mapeamentoCampos['Email do Responsavel pelo Polo']] || '';

            // Preenche os campos de Dados do Polo (CORREÇÃO DE IDS APLICADA AQUI!)
            document.getElementById('Nome_e_Numero_do_Polo').value = poloSelecionado[mapeamentoCampos['Nome e Numero do Polo']] || '';
            document.getElementById('CEP_do_Polo').value = poloSelecionado[mapeamentoCampos['CEP do Polo']] || '';
            document.getElementById('CNPJ_do_Polo').value = poloSelecionado[mapeamentoCampos['CNPJ do Polo']] || ''; // ID corrigido
            
            let enderecoCompletoPelaApi = poloSelecionado[mapeamentoCampos['Endereco do Polo']] || '';
            // Constrói o endereço completo de forma mais precisa, se os dados estiverem disponíveis
            if (poloSelecionado.pol_address_number) { 
                enderecoCompletoPelaApi += ', ' + poloSelecionado.pol_address_number;
            }
            if (poloSelecionado.pol_address_complement) { 
                enderecoCompletoPelaApi += ' - ' + poloSelecionado.pol_address_complement;
            }
            if (poloSelecionado.pol_district) { 
                enderecoCompletoPelaApi += ', ' + poloSelecionado.pol_district;
            }
            if (poloSelecionado.pol_city) {
                enderecoCompletoPelaApi += ' - ' + poloSelecionado.pol_city;
            }
            if (poloSelecionado.pol_state) { 
                enderecoCompletoPelaApi += '/' + poloSelecionado.pol_state;
            }

            document.getElementById('Endereco_do_Polo').value = enderecoCompletoPelaApi;

            // Se o CEP foi preenchido pela API do polo, e o endereço ainda está incompleto,
            // aciona a busca da ViaCEP como fallback
            if (document.getElementById('CEP_do_Polo').value && enderecoCompletoPelaApi.trim().length < 10) {
                console.log('Endereço da API do polo incompleto. Tentando ViaCEP...');
                const event = new Event('blur');
                document.getElementById('CEP_do_Polo').dispatchEvent(event); // Dispara o evento 'blur' no campo CEP
            }

        } else {
            // Limpa todos os campos quando o polo é deselecionado (ou "-- Selecione um Polo --" é escolhido)
            document.getElementById('Email').value = '';
            document.getElementById('Nome_do_Responsavel_pelo_Polo').value = '';
            document.getElementById('Telefone_do_Responsavel_pelo_Polo').value = '';
            document.getElementById('Email_do_Responsavel_pelo_Polo').value = ''; // Limpa o novo campo também
            document.getElementById('Nome_e_Numero_do_Polo').value = '';
            document.getElementById('CEP_do_Polo').value = ''; 
            document.getElementById('CNPJ_do_Polo').value = ''; // Limpa o CNPJ
            document.getElementById('Endereco_do_Polo').value = '';
        }
    });

    // --- Lógica de preenchimento de endereço por CEP (ViaCEP) ---
    // Este código já estava aqui e funciona para quando o usuário digita o CEP manualmente

    if (inputCep) { 
        inputCep.addEventListener('blur', async function() { 
            let cep = this.value.replace(/\D/g, ''); 

            if (cep.length != 8) {
                return;
            }

            inputEndereco.value = 'Buscando...';

            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (!("erro" in data)) {
                    inputEndereco.value = `${data.logradouro || ''}, ${data.complemento || ''} - ${data.bairro || ''}, ${data.localidade || ''} - ${data.uf || ''}`;
                } else {
                    inputEndereco.value = '';
                    alert("CEP não encontrado.");
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
                inputEndereco.value = '';
                alert("Erro ao buscar CEP. Tente novamente.");
            }
        });
    }
});

// --- Lógica de envio do formulário ---
document.getElementById('myForm').addEventListener('submit', async function(event) {
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
            
            // Re-define estados iniciais após o reset do formulário
            document.getElementById('estruturaPropria').checked = true; 
            document.getElementById('parceriaFields').style.display = 'none'; 
            document.getElementById('Link_Contrato_de_Parceria').removeAttribute('required'); 
            document.getElementById('Link_Contrato_de_Parceria').value = '';

            const selectPolo = document.getElementById('selecionarPolo');
            selectPolo.value = ''; 
            const changeEventPolo = new Event('change'); 
            selectPolo.dispatchEvent(changeEventPolo); // Dispara o evento 'change' para limpar os campos relacionados ao polo

            const selectCurso = document.getElementById('selecionarCurso');
            selectCurso.value = ''; 
            mostrarListaRequisitosPorCurso(''); 
            popularSemestres(''); 

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