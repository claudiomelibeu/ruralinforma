document.addEventListener('DOMContentLoaded', () => {
    // Ouve o clique no botão Calcular
    document.getElementById('calcular-btn').addEventListener('click', calcular);
    
    // Ouve o clique no botão Imprimir (NOVO)
    document.getElementById('imprimir-btn').addEventListener('click', () => {
        window.print();
    });

    // Ouve a mudança de gênero para trocar os nomes das dobras
    document.getElementById('genero').addEventListener('change', atualizarLabels);
    
    // Configura labels iniciais
    atualizarLabels();
});

function atualizarLabels() {
    const genero = document.getElementById('genero').value;
    if (genero === 'feminino') {
        document.getElementById('label-dobra1').innerText = 'Tríceps (mm):';
        document.getElementById('label-dobra2').innerText = 'Supraíliaca (mm):';
    } else {
        document.getElementById('label-dobra1').innerText = 'Peitoral (mm):';
        document.getElementById('label-dobra2').innerText = 'Abdominal (mm):';
    }
}

function calcular() {
    // 1. Coleta de Dados
    const nome = document.getElementById('nome').value || 'Não informado';
    const dataAval = document.getElementById('data-avaliacao').value;
    const genero = document.getElementById('genero').value;
    const idade = parseFloat(document.getElementById('idade').value) || 0;
    const estaturaCm = parseFloat(document.getElementById('estatura').value) || 0;
    const peso = parseFloat(document.getElementById('peso').value) || 0;

    const d1 = parseFloat(document.getElementById('dc-dobra1').value) || 0;
    const d2 = parseFloat(document.getElementById('dc-dobra2').value) || 0;
    const d3 = parseFloat(document.getElementById('dc-coxa').value) || 0;

    const cintura = parseFloat(document.getElementById('circ-cintura').value) || 0;
    const quadril = parseFloat(document.getElementById('circ-quadril').value) || 0;
    
    const punho = parseFloat(document.getElementById('diam-biestiloide').value) || 0;
    const femur = parseFloat(document.getElementById('diam-bicondiliano').value) || 0;

    const dinMao = parseFloat(document.getElementById('din-mao').value) || 0;
    const dinLombar = parseFloat(document.getElementById('din-lombar').value) || 0;

    // Conversão para Metros
    const estM = estaturaCm / 100;

    // --- CÁLCULOS ---

    // 1. IMC
    let imc = 0;
    if (estM > 0) imc = peso / (estM * estM);
    
    // 2. RCQ
    let rcq = 0;
    if (quadril > 0) rcq = cintura / quadril;

    // 3. Densidade e Gordura (Pollock 3)
    let somaDobras = d1 + d2 + d3;
    let densidade = 0;

    if (genero === 'feminino') {
        densidade = 1.0994921 - (0.0009929 * somaDobras) + (0.0000023 * somaDobras * somaDobras) - (0.0001392 * idade);
    } else {
        densidade = 1.10938 - (0.0008267 * somaDobras) + (0.0000016 * somaDobras * somaDobras) - (0.0002574 * idade);
    }

    // Siri
    let percGordura = (495 / densidade) - 450;
    
    // Proteção para números malucos
    if (somaDobras === 0 || densidade <= 0) percGordura = 0;

    // Massas
    let pesoGordura = (percGordura / 100) * peso;
    
    // Peso Ósseo (Rocha)
    let pesoOsseo = 0;
    if (estM > 0 && punho > 0 && femur > 0) {
        let base = (estM * estM) * (punho/100) * (femur/100) * 400;
        pesoOsseo = 3.02 * Math.pow(base, 0.712);
    }

    // Peso Residual
    let pesoResidual = 0;
    if (genero === 'feminino') {
        pesoResidual = peso * 0.209;
    } else {
        pesoResidual = peso * 0.241;
    }

    let pesoMagroTotal = peso - pesoGordura;
    let pesoMuscular = pesoMagroTotal - pesoOsseo - pesoResidual;

    // 4. Metabolismo
    let tmbMifflin = 0;
    let tmbHarris = 0;

    if (genero === 'feminino') {
        tmbMifflin = (10 * peso) + (6.25 * estaturaCm) - (5 * idade) - 161;
        tmbHarris = 655 + (9.6 * peso) + (1.9 * estaturaCm) - (4.7 * idade);
    } else {
        tmbMifflin = (10 * peso) + (6.25 * estaturaCm) - (5 * idade) + 5;
        tmbHarris = 66 + (13.8 * peso) + (5 * estaturaCm) - (6.8 * idade);
    }

    // 5. Força Relativa
    let frMao = peso > 0 ? dinMao / peso : 0;
    let frLombar = peso > 0 ? dinLombar / peso : 0;


    // --- EXIBIÇÃO ---
    
    // Preenche cabeçalho do relatório (Para Impressão)
    setText('rel-nome', nome);
    // Formata a data para dia/mes/ano se houver data
    if(dataAval) {
        const d = new Date(dataAval);
        setText('rel-data', d.toLocaleDateString('pt-BR', {timeZone: 'UTC'}));
    } else {
        setText('rel-data', '--/--/----');
    }
    setText('rel-idade', idade + ' anos');
    
    // Mostra o cabeçalho no HTML (mas o CSS vai esconder até imprimir)
    document.getElementById('cabecalho-relatorio').style.display = 'block';

    // Resultados
    setText('res-imc', imc.toFixed(2));
    setText('class-imc', classificarIMC(imc));
    setText('res-rcq', rcq.toFixed(3));

    // Gráfico
    atualizarGraficoGordura(percGordura, genero);
    
    setText('res-peso-gordura', pesoGordura.toFixed(2) + ' kg');
    setText('res-peso-muscular', pesoMuscular.toFixed(2) + ' kg');
    setText('res-peso-osseo', pesoOsseo.toFixed(2) + ' kg');
    setText('res-peso-residual', pesoResidual.toFixed(2) + ' kg');
    setText('res-peso-magro', pesoMagroTotal.toFixed(2) + ' kg');

    setText('res-tmb-mifflin', tmbMifflin.toFixed(0) + ' kcal');
    setText('res-tmb-harris', tmbHarris.toFixed(0) + ' kcal');

    setText('res-forca-mao', frMao.toFixed(2));
    setText('res-forca-lombar', frLombar.toFixed(2));

    // MOSTRAR O BOTÃO DE IMPRIMIR
    document.getElementById('imprimir-btn').style.display = 'block';
}

function setText(id, valor) {
    document.getElementById(id).innerText = valor;
}

function classificarIMC(imc) {
    if (imc < 18.5) return '(Baixo)';
    if (imc < 25) return '(Normal)';
    if (imc < 30) return '(Sobrepeso)';
    return '(Obesidade)';
}

function atualizarGraficoGordura(pg, genero) {
    let valorVisual = pg;
    if (valorVisual < 0) valorVisual = 0;
    if (valorVisual > 100) valorVisual = 100;

    const barra = document.getElementById('grafico-barra');
    const textoVal = document.getElementById('res-gordura-val');
    const textoClass = document.getElementById('grafico-texto');

    barra.style.width = valorVisual + '%';
    textoVal.innerText = pg.toFixed(1) + '%';

    let classe = '';
    let cor = '';

    if (genero === 'feminino') {
        if (pg < 14) { classe = 'Essencial'; cor = '#ffc107'; } 
        else if (pg < 21) { classe = 'Atleta'; cor = '#28a745'; } 
        else if (pg < 25) { classe = 'Fitness'; cor = '#20c997'; } 
        else if (pg < 32) { classe = 'Aceitável'; cor = '#17a2b8'; } 
        else { classe = 'Obeso'; cor = '#dc3545'; } 
    } else {
        if (pg < 6) { classe = 'Essencial'; cor = '#ffc107'; }
        else if (pg < 14) { classe = 'Atleta'; cor = '#28a745'; }
        else if (pg < 18) { classe = 'Fitness'; cor = '#20c997'; }
        else if (pg < 25) { classe = 'Aceitável'; cor = '#17a2b8'; }
        else { classe = 'Obeso'; cor = '#dc3545'; }
    }

    textoClass.innerText = classe;
    textoClass.style.color = cor;
    barra.style.backgroundColor = cor;
}