// Aguarda a página carregar completamente
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÃO INICIAL ---
    const btnCalcular = document.getElementById('calcular-btn');
    const selectGenero = document.getElementById('genero');

    // Adiciona um "ouvinte" para o clique no botão
    btnCalcular.addEventListener('click', calcularTudo);

    // Adiciona um "ouvinte" para a mudança no Gênero
    selectGenero.addEventListener('change', atualizarEtiquetasDobras);

    // Chama a função uma vez no início para garantir que as etiquetas estão corretas
    atualizarEtiquetasDobras();
});

/**
 * Função para mudar as etiquetas das dobras conforme o gênero
 * Feminino: Tríceps, Supraíliaca
 * Masculino: Peitoral, Abdominal
 */
function atualizarEtiquetasDobras() {
    const genero = document.getElementById('genero').value;
    const labelDobra1 = document.getElementById('label-dobra1');
    const labelDobra2 = document.getElementById('label-dobra2');

    if (genero === 'feminino') {
        labelDobra1.textContent = 'Tríceps (mm):';
        labelDobra2.textContent = 'Supraíliaca (mm):';
    } else { // masculino
        labelDobra1.textContent = 'Peitoral (mm):';
        labelDobra2.textContent = 'Abdominal (mm):';
    }
}

/**
 * Função principal que lê os dados e chama os cálculos
 */
function calcularTudo() {
    
    // --- 1. LEITURA DOS DADOS (PEGAR VALORES DO HTML) ---
    const genero = document.getElementById('genero').value; // 'feminino' ou 'masculino'
    const idade = parseFloat(document.getElementById('idade').value);
    const estaturaCm = parseFloat(document.getElementById('estatura').value);
    const peso = parseFloat(document.getElementById('peso').value);

    // Dobras (mm)
    const dobra1 = parseFloat(document.getElementById('dc-dobra1').value); // Tríceps ou Peitoral
    const dobra2 = parseFloat(document.getElementById('dc-dobra2').value); // Supraíliaca ou Abdominal
    const dobra3 = parseFloat(document.getElementById('dc-coxa').value); // Coxa

    // Circunferências (cm)
    const circCintura = parseFloat(document.getElementById('circ-cintura').value);
    const circQuadril = parseFloat(document.getElementById('circ-quadril').value);

    // Diâmetros (cm)
    const diamBiestiloideCm = parseFloat(document.getElementById('diam-biestiloide').value);
    const diamBicondilianoCm = parseFloat(document.getElementById('diam-bicondiliano').value);

    // Testes Funcionais (kg)
    const dinMao = parseFloat(document.getElementById('din-mao').value);
    const dinLombar = parseFloat(document.getElementById('din-lombar').value);

    // Conversões de Unidade
    const estaturaM = estaturaCm / 100.0;
    const diamBiestiloideM = diamBiestiloideCm / 100.0;
    const diamBicondilianoM = diamBicondilianoCm / 100.0;

    // --- 2. EXECUÇÃO DOS CÁLCULOS ---
    
    // Cálculos Gerais
    const imc = peso / (estaturaM * estaturaM);
    const imcClass = classificarIMC(imc);
    const rcq = circCintura / circQuadril;

    // Cálculos que dependem do Gênero
    let densidade, tmbMifflin, tmbHarris, pesoResidual;
    const somaDobras = dobra1 + dobra2 + dobra3;

    if (genero === 'feminino') {
        // Pollock 3 Dobras (Tríceps, Supraíliaca, Coxa) - Feminino
        densidade = 1.0994921 - (0.0009929 * somaDobras) + (0.0000023 * (somaDobras * somaDobras)) - (0.0001392 * idade);
        
        // TMB Mifflin St-Jeor (Feminino)
        tmbMifflin = (10 * peso) + (6.25 * estaturaCm) - (5 * idade) - 161;

        // TMB Harris-Benedict (Feminino) - Fórmula da sua planilha
        tmbHarris = 655 + (9.6 * peso) + (1.9 * estaturaCm) - (4.7 * idade);

        // Peso Residual (Feminino) - Fórmula da sua planilha
        pesoResidual = peso * 0.209; // 20.9% do Peso Corporal

    } else { // 'masculino'
        // Pollock 3 Dobras (Peitoral, Abdominal, Coxa) - Masculino
        densidade = 1.10938 - (0.0008267 * somaDobras) + (0.0000016 * (somaDobras * somaDobras)) - (0.0002574 * idade);

        // TMB Mifflin St-Jeor (Masculino)
        tmbMifflin = (10 * peso) + (6.25 * estaturaCm) - (5 * idade) + 5;

        // TMB Harris-Benedict (Masculino) - Fórmula padrão
        tmbHarris = 66 + (13.8 * peso) + (5 * estaturaCm) - (6.8 * idade);

        // Peso Residual (Masculino) - Fórmula padrão
        pesoResidual = peso * 0.241; // 24.1% do Peso Corporal
    }

    // Composição Corporal (Siri, Rocha)
    const percGordura = (495 / densidade) - 450;
    const pesoGordura = (percGordura / 100) * peso;

    // Peso Ósseo (Rocha/Von Döbeln) - Fórmula da sua planilha (independe de gênero)
    const po_parte1 = (estaturaM * estaturaM) * diamBiestiloideM * diamBicondilianoM * 400;
    const po_parte2 = Math.pow(po_parte1, 0.712);
    const pesoOsseo = 3.02 * po_parte2;

    const pesoMagro = peso - pesoGordura;
    const pesoMuscular = pesoMagro - pesoOsseo - pesoResidual;

    // Testes Funcionais
    const forcaRelMao = dinMao / peso;
    const forcaRelLombar = dinLombar / peso;

    // --- 3. EXIBIÇÃO DOS RESULTADOS (ENVIAR PARA O HTML) ---
    
    // .toFixed(X) arredonda o número para X casas decimais
    document.getElementById('resultado-imc').textContent = imc.toFixed(2);
    document.getElementById('resultado-imc-class').textContent = imcClass;
    document.getElementById('resultado-rcq').textContent = rcq.toFixed(3);
    
    document.getElementById('resultado-densidade').textContent = densidade.toFixed(7);
    document.getElementById('resultado-perc-gordura').textContent = percGordura.toFixed(2);
    document.getElementById('resultado-peso-gordura').textContent = pesoGordura.toFixed(2);
    document.getElementById('resultado-peso-osseo').textContent = pesoOsseo.toFixed(2);
    document.getElementById('resultado-peso-residual').textContent = pesoResidual.toFixed(2);
    document.getElementById('resultado-peso-magro').textContent = pesoMagro.toFixed(2);
    document.getElementById('resultado-peso-muscular').textContent = pesoMuscular.toFixed(2);

    document.getElementById('resultado-tmb-mifflin').textContent = tmbMifflin.toFixed(0);
    document.getElementById('resultado-tmb-harris').textContent = tmbHarris.toFixed(0);

    document.getElementById('resultado-forca-mao').textContent = forcaRelMao.toFixed(2);
    document.getElementById('resultado-forca-lombar').textContent = forcaRelLombar.toFixed(2);


    // ===========================================
    //   CÓDIGO PARA ATUALIZAR O GRÁFICO
    // ===========================================
    
    // Pega a classificação (texto e cor) da nova função
    const classificacaoGordura = classificarGordura(genero, percGordura);
    
    // Pega os elementos do gráfico que criamos no HTML
    const graficoBar = document.getElementById('grafico-bar-gordura');
    const graficoIndicator = document.getElementById('grafico-indicator-gordura');
    const graficoTitulo = document.getElementById('grafico-classificacao');

    // Limita o valor da barra a 100% (segurança)
    const percGorduraSeguro = Math.min(Math.max(percGordura, 0), 100);

    // 1. Atualiza a BARRA
    graficoBar.style.width = percGorduraSeguro + '%';
    graficoBar.style.backgroundColor = classificacaoGordura.cor;

    // 2. Atualiza o INDICADOR (a bolha com o número)
    graficoIndicator.textContent = percGordura.toFixed(1) + '%';
    graficoIndicator.style.left = percGorduraSeguro + '%'; // Move para a posição correta
    graficoIndicator.style.color = classificacaoGordura.cor; // Muda a cor do texto

    // 3. Atualiza o TÍTULO da classificação
    graficoTitulo.textContent = classificacaoGordura.texto;

    // ===========================================
    //         FIM DO CÓDIGO DO GRÁFICO
    // ===========================================

} // <-- Fim da função calcularTudo()


/**
 * Função auxiliar para classificar o IMC
 */
function classificarIMC(imc) {
    if (imc < 18.5) return 'Abaixo do Peso';
    if (imc < 24.9) return 'Peso Normal';
    if (imc < 29.9) return 'Sobrepeso';
    if (imc < 34.9) return 'Obesidade Grau I';
    if (imc < 39.9) return 'Obesidade Grau II';
    return 'Obesidade Grau III';
}

/**
 * Função auxiliar para classificar o % de Gordura
 * (Baseado nas normas do American Council on Exercise - ACE)
 * Retorna um objeto { texto: '...', cor: '...' }
 */
function classificarGordura(genero, percGordura) {
    let classificacao = '--';
    let cor = '#007bff'; // Azul (Média)

    if (genero === 'feminino') {
        if (percGordura < 14) { classificacao = 'Essencial'; cor = '#ffc107'; } // Amarelo
        else if (percGordura < 21) { classificacao = 'Atleta'; cor = '#28a745'; } // Verde
        else if (percGordura < 25) { classificacao = 'Em Forma'; cor = '#17a2b8'; } // Ciano
        else if (percGordura < 32) { classificacao = 'Média'; cor = '#007bff'; } // Azul
        else { classificacao = 'Obeso'; cor = '#dc3545'; } // Vermelho
    } else { // 'masculino'
        if (percGordura < 6) { classificacao = 'Essencial'; cor = '#ffc107'; } // Amarelo
        else if (percGordura < 14) { classificacao = 'Atleta'; cor = '#28a745'; } // Verde
        else if (percGordura < 18) { classificacao = 'Em Forma'; cor = '#17a2b8'; } // Ciano
        else if (percGordura < 25) { classificacao = 'Média'; cor = '#007bff'; } // Azul
        else { classificacao = 'Obeso'; cor = '#dc3545'; } // Vermelho
    }
    return { texto: classificacao, cor: cor };
}