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