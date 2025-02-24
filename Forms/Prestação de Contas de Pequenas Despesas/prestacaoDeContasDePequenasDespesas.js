//const baseURL = `http://127.0.0.1:3000`;
const baseURL = `http://192.168.218.26:3000`;
const formsPage = '/';
const loginPage = '../../login.html';
const PrestacaoContas = 'prestacaoDeContasDePequenasDespesas.html'
const formPrestacaoContas = 'formPrestacaoDeContasDePequenasDespesas.html';
var tipoAtividadeApi = sessionStorage.getItem('tipoAtividade');
var cpfGestorApi = sessionStorage.getItem('cpfGestor');
var nomeGestorApi = sessionStorage.getItem('nomeGestor');

window.onload = function() {
    authentication();

    header();

    if (document.title == 'Form process') {
        const newForm = document.getElementById('newForm');
        
        loadCards();

        search();
        
        newForm.onclick = function() {
            localStorage.removeItem('cardId');
            localStorage.setItem('correcao', 'false');
            localStorage.setItem('adicionar', 'true');
            document.location.href = formPrestacaoContas;
        }
    }
    if (document.title == 'Form') {
        const cancelForm = document.getElementById('cancelForm');
        const cancelFormPopup = document.getElementById('cancelFormPopup');
        const cancelBackgroud = document.getElementById('cancelBackgroud');
        const dontCancel = document.getElementById('dontCancel');
        const sendForm = document.getElementById('sendForm');
        const sendFormPopup = document.getElementById('sendFormPopup');
        const sendBackgroud = document.getElementById('sendBackgroud');
        const btnCorrigir = document.getElementById('btnCorrigir');
        const btnEnviar = document.getElementById('btnEnviar');
        const enviarPara = document.getElementById('enviarPara');
        const somenteSalvar = document.getElementById('somenteSalvar');
        const btnADD = document.getElementById('btnADD');
        const tabela = document.querySelector('table');
        const loadingFullScreen = document.getElementById('loadingFullScreen');
        const limiteCartao = document.getElementById('limiteCartao');
        const valorUtilizado = document.getElementById('valorUtilizado');

        aplicarMascara(limiteCartao);
        aplicarMascara(valorUtilizado);

        valorUtilizado.addEventListener('keyup', function(e) {
            if (parseFloat(limiteCartao.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')) < parseFloat(valorUtilizado.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'))) {
                valorUtilizado.style.border = '1px solid red';
                valorUtilizado.style.background = 'red';
            }
            else {
                valorUtilizado.style.border = '1px solid var(--border-color)';
                valorUtilizado.style.background = 'background-color: var(--form-paper-background-color)';
            }
        });

        tabela.onclick = function(e) {
            if (!e.target.classList.contains('btnDelete')) {
                return
            }
            e.target.closest('tr').remove();
            calcularTotal();
        }

        btnADD.onclick = function() {
            const novaLinha = tableRows('', '', '', '', '', '', '', '');
            tabela.insertAdjacentHTML('beforeend', novaLinha);

            const novosInputsValorNota = document.querySelectorAll('#valorNota:not([data-listener-adicionado])'); // Seleciona apenas os inputs novos.
            novosInputsValorNota.forEach(input => {
                input.addEventListener('change', calcularTotal);
                input.setAttribute('data-listener-adicionado', 'true'); // Marca o input para não adicionar o listener novamente.
            });

            calcularTotal(); // Recalcula o total após adicionar a linha

            // Aplica a máscara aos inputs existentes
            const inputsExistentes = document.querySelectorAll('#valorNota');
            inputsExistentes.forEach(input => {
                aplicarMascara(input);
            });

            const novoInputValorNota = tabela.querySelector('#valorNota:last-of-type');

            novoInputValorNota.addEventListener('keyup', function(e) {
                calcularTotal(); // Recalcula o total
            });

            aplicarMascara(novoInputValorNota);
        }

        function aplicarMascara(input) {
            new Cleave(input, {
                numeral: true,
                numeralThousandsGroupStyle: 'thousand',
                numeralDecimalMark: ',',
                delimiter: '.',
                prefix: 'R$ ',
                noImmediate: false // Formatação imediata
            });
        }

        cancelForm.onclick = function() {
            cancelFormPopup.style = 'flex';
            document.documentElement.style.overflow = 'hidden';
        }

        cancelBackgroud.onclick = function() {
            cancelFormPopup.style.opacity = 0;

            setTimeout(() => {
                cancelFormPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 200);
        }

        dontCancel.onclick = function() {
            cancelFormPopup.style.opacity = 0;

            setTimeout(() => {
                cancelFormPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 200);
        }

        sendForm.onclick = function() {
            sendFormPopup.style = 'flex';
            enviarPara.innerText = 'Enviar para: ' + nomeGestorApi;
            document.documentElement.style.overflow = 'hidden';
        }

        sendBackgroud.onclick = function() {
            sendFormPopup.style.opacity = 0;

            setTimeout(() => {
                sendFormPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 200);
        }

        btnCorrigir.onclick = function() {
            sendFormPopup.style.opacity = 0;

            setTimeout(() => {
                sendFormPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 200);
        }

        btnEnviar.onclick = function() {
            localStorage.setItem('correcao', 'false');
            localStorage.setItem('adicionar', 'true');
            sendFormApi(tabela, false);
        }

        somenteSalvar.onclick = function() {
            loadingFullScreen.style.display = 'flex';
            localStorage.setItem('correcao', 'false');
            localStorage.setItem('adicionar', 'true');
            sendFormApi(tabela, true);
        }

        function calcularTotal() {
            let total = 0;
            const elementosValorNota = document.querySelectorAll('#valorNota');
          
            elementosValorNota.forEach(elemento => {
              let valorString = elemento.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'); // Limpeza do valor
              const valor = parseFloat(valorString);
          
              if (!isNaN(valor)) {
                total += valor;
              }
            });
          
            const formattedTotal = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(total);
          
            if (total > parseFloat(document.getElementById('valorUtilizado').value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'))) {
                document.getElementById('totalGeral').style.border = '1px solid red';
                document.getElementById('totalGeral').style.background = 'red';
            }
            else {
                document.getElementById('totalGeral').style.border = '1px solid var(--border-color)';
                document.getElementById('totalGeral').style.background = 'var(--form-paper-background-color)';
            }
            document.getElementById('totalGeral').value = formattedTotal;
        }
        
        // Chama a função calcularTotal() inicialmente.
        calcularTotal();
    }
}

function tableRows(dataOcorrencia, atividade, entrada, saidaIntervalo, entradaIntervalo, saida, disabled, style) {
    return `<tr>
        <td>
            <label for="numNotaFiscal" class="tableLabels" style="display: none;">N° da Nota Fiscal/Cupom</label>
            <input type="number" name="numNotaFiscal" id="numNotaFiscal" class="FormInputs" placeholder="N° nota fiscal" value="${dataOcorrencia}" ${disabled}>
        </td>
        <td>
            <label for="dataCompra" class="tableLabels" style="display: none;">Aula e/ou Atividade</label>
            <input type="date" name="dataCompra" id="dataCompra" class="FormInputs" value="${atividade}" ${disabled}>
        </td>
        <td>
            <label for="itenAdquiridos" class="tableLabels" style="display: none;">Itens Adquiridos</label>
            <textarea type="text" name="itenAdquiridos" id="itenAdquiridos" class="FormInputs" placeholder="Itens Adquiridos" rows="1" ${disabled}>${entrada}</textarea>
        </td>
        <td>
            <label for="quantidade" class="tableLabels" style="display: none;">Saída para o Intervalo</label>
            <input type="number" name="quantidade" id="quantidade" class="FormInputs" placeholder="Quant." value="${saidaIntervalo}" ${disabled}>
        </td>
        <td>
            <label for="valorNota" class="tableLabels" style="display: none;">Valor da Nota (R$)</label>
            <input type="text" name="valorNota" id="valorNota" class="FormInputs" value="${entradaIntervalo}" ${disabled}>
        </td>
        <td>
            <label for="justCompra" class="tableLabels" style="display: none;">Justificativa da Compra</label>
            <textarea type="text" name="justCompra" id="justCompra" class="FormInputs" placeholder="Justificativa da Compra" rows="1" ${disabled}>${saida}</textarea>
        </td>
        <td ${style}><button class="btnDelete">Delete</button></td>
    </tr>`;
}

async function sendFormApi(tabela, somenteSalvar) {
    const token = localStorage.getItem('token');
    const cardId = localStorage.getItem('cardId');
    const linhas = tabela.querySelectorAll('tr');
    const nomeResponsavel = document.getElementById('nomeResponsavel');
    const departamentoAcessoria = document.getElementById('departamentoAcessoria');
    const nomeGestor = document.getElementById('nomeGestor');
    const dataInicio = document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');
    const limiteCartao = document.getElementById('limiteCartao');
    const valorUtilizado = document.getElementById('valorUtilizado');
    const totalGeral = document.getElementById('totalGeral');

    let formIds = [];
    let formData = [];

    formIds.push('nomeResponsavel');
    formData.push(nomeResponsavel.value);
    formIds.push('departamentoAcessoria');
    formData.push(departamentoAcessoria.value);
    formIds.push('nomeGestor');
    formData.push(nomeGestor.value);
    formIds.push('dataInicio');
    formData.push(dataInicio.value);
    formIds.push('dataFim');
    formData.push(dataFim.value);
    formIds.push('limiteCartao');
    formData.push(limiteCartao.value);
    formIds.push('valorUtilizado');
    formData.push(valorUtilizado.value);
    formIds.push('totalGeral');
    formData.push(totalGeral.value);
    let data = {}
    
    let col = -1;
    linhas.forEach(linha => {
        col++;
        const colunas = linha.querySelectorAll('td');
        const inputs = linha.querySelectorAll('input');
        const textareas = linha.querySelectorAll('textarea');

        colunas.forEach((coluna, index) => {
            if (index != 6) {
                if (index == 0) {
                    formIds.push('numNotaFiscal___' + col);
                    formData.push(inputs[0].value);
                }
                if (index == 1) {
                    formIds.push('dataCompra___' + col);
                    formData.push(inputs[1].value);
                }
                if (index == 2) {
                    data[`itenAdquiridos___${col}`] = textareas[0].value;
                }
                if (index == 3) {
                    formIds.push('quantidade___' + col);
                    formData.push(inputs[2].value);
                }
                if (index == 4) {
                    formIds.push('valorNota___' + col);
                    formData.push(inputs[3].value);
                }
                if (index == 5) {
                    data[`justCompra___${col}`] = textareas[1].value;
                }
            }
              
        });
    });

    if (Object.keys(data).length === 0) {
        data.vazio = 'vazio';
    }

    let textAreaData = JSON.stringify(data);

    let targetState = 2;

    if (cardId == null) {
        //Ids campos, dados campos, ids e dados textAreas, é somente salvar?, tokenUser
        //Proxima atividade, nome formulário, cpf do gestor, nome do gestor
        //tipo atividade pta/professor, passar para proxima atividade?, tipo setor, proxima pagina
        if (parseFloat(limiteCartao.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')) < parseFloat(valorUtilizado.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'))) {
            alert('O valor utilizado deve ser menor que o limite do cartão!');
        }
        else if (parseFloat(document.getElementById('totalGeral').value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')) > parseFloat(document.getElementById('valorUtilizado').value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'))) {
            alert('O valor total dos itens deve ser menor que o valor utilizado do cartão!')
        }
        else {
            processStart(formIds, formData, textAreaData, somenteSalvar, token, 
                targetState, 'Prestação de Contas de Pequenas Despesas', cpfGestorApi, nomeGestorApi, 
                tipoAtividadeApi, 'false', 'RH', PrestacaoContas);
        }
    }
    else if (cardId != null) {
        if (parseFloat(limiteCartao.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')) < parseFloat(valorUtilizado.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'))) {
            alert('O valor utilizado deve ser menor que o limite do cartão!');
        }
        else if (parseFloat(document.getElementById('totalGeral').value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')) > parseFloat(document.getElementById('valorUtilizado').value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'))) {
            alert('O valor total dos itens deve ser menor que o valor utilizado do cartão!')
        }
        else {
            processUpdate(cardId, formIds, formData, textAreaData, somenteSalvar, token,
                cpfGestorApi, 8, 'Prestação de Contas de Pequenas Despesas', 'RH', targetState, PrestacaoContas);
        }
    }
}

function loadCards() {
    const token = localStorage.getItem('token');
    const bodyCardsAprovGestor = document.getElementById('bodyCardsAprovGestor');
    const cardsAprovGestor = document.getElementById('cardsAprovGestor');
    const bodyCardsCorreção = document.getElementById('bodyCardsCorreção');
    const cardsCorrecao = document.getElementById('cardsCorrecao');
    const cardsSkeleton = document.getElementById('cardsSkeleton');
    const cardsRascunho = document.getElementById('cardsRascunho');
    const bodyCardsRascunho = document.getElementById('bodyCardsRascunho');
    const cardsAprovFinanceiro = document.getElementById('cardsAprovFinanceiro');
    const bodyCardsAprovFinanceiro = document.getElementById('bodyCardsAprovFinanceiro');
    const cardsAprovControladoria = document.getElementById('cardsAprovControladoria');
    const bodyCardsAprovControladoria = document.getElementById('bodyCardsAprovControladoria');
    const cardsAprovados = document.getElementById('cardsAprovados');
    const bodyCardsAprovados = document.getElementById('bodyCardsAprovados');
    bodyCardsAprovGestor.innerHTML = '';
    bodyCardsCorreção.innerHTML = '';
    bodyCardsRascunho.innerHTML = '';
    bodyCardsAprovFinanceiro.innerHTML = '';
    bodyCardsAprovControladoria.innerHTML = '';
    bodyCardsAprovados.innerHTML = '';

    axios.post(baseURL + '/process/all', {
        tipoAtividade: tipoAtividadeApi,
        processId: 'Prestação de Contas de Pequenas Despesas'
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    })
    .then(response => {
       
      const processos = response.data;
      cardsSkeleton.style.display = 'none';
      processos.forEach(processo => {
        const activities = processo.activities;
        activities.sort((a, b) => b.movementSequence - a.movementSequence);
        const ultimoMovimento = activities[0];
        
        if (ultimoMovimento.state.sequence == 1 && processo.active == true) {
            cardsRascunho.style.display = 'flex';
            populateCards(ultimoMovimento, 'bodyCardsRascunho', formPrestacaoContas);
        }
        if (ultimoMovimento.state.sequence == 6 && processo.active == true) {
            cardsCorrecao.style.display = 'flex';
            populateCards(ultimoMovimento, 'bodyCardsCorreção', formPrestacaoContas);
        }
        if (ultimoMovimento.state.sequence == 2 && processo.active == true) {
            cardsAprovGestor.style.display = 'flex';
            populateCards(ultimoMovimento, 'bodyCardsAprovGestor', formPrestacaoContas);
        }
        if (ultimoMovimento.state.sequence == 2 && processo.active == true) {
            cardsAprovGestor.style.display = 'flex';
            populateCards(ultimoMovimento, 'bodyCardsAprovGestor', formPrestacaoContas);
        } 
        if (ultimoMovimento.state.sequence == 10 && processo.active == true) {
            cardsAprovFinanceiro.style.display = 'flex';
            populateCards(ultimoMovimento, 'cardsAprovFinanceiro', formPrestacaoContas);
        }  
        if (ultimoMovimento.state.sequence == 13 && processo.active == true) {
            cardsAprovControladoria.style.display = 'flex';
            populateCards(ultimoMovimento, 'cardsAprovControladoria', formPrestacaoContas);
        }     
        if (ultimoMovimento.state.sequence == 16) {
            cardsAprovados.style.display = 'flex';
            populateCards(ultimoMovimento, 'bodyCardsAprovados', formOcorrenciasPonto);
        } 
      });
    })
    .catch(erro => {
      console.error(erro);
    });
}

function authentication() {
    const token = localStorage.getItem('token');
    const nomeUser = document.getElementById('nomeUser');
    const setorCurso = document.getElementById('setorCurso');
    const selectCursoSetor = document.getElementById('selectCursoSetor');
    const adicionarlocalStorage = localStorage.getItem('adicionar');
    const correcaoStorage = localStorage.getItem('correcao');
    const cancelForm = document.getElementById('cancelForm');
    const sendForm = document.getElementById('sendForm');
    const returnToProcessCards = document.getElementById('returnToProcessCards');
    const somenteSalvar =  document.getElementById('somenteSalvar');
    const deleteTh = document.getElementById('deleteTh');
    const btnADD = document.getElementById('btnADD');
    const nomeResponsavel = document.getElementById('nomeResponsavel');
    const departamentoAcessoria = document.getElementById('departamentoAcessoria');
    const nomeGestorForm = document.getElementById('nomeGestor');

    axios.get(baseURL + `/user/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    })
    .then(response => {
        nomeUser.innerHTML = response.data.nome;
        const cursoSetor = response.data.cursoSetor;
        const tipoAtividade = response.data.tipoAtividade;
        const cpfGestor = response.data.cpfGestor;
        const nomeGestor = response.data.nomeGestor;
        const selectTipoAtividade = document.getElementById('selectTipoAtividade');
        const containerUser = document.getElementById('containerUser');
        let i = 0;
         
        cursoSetor.forEach(cursoSetor => {
            selectCursoSetor.innerHTML += `<option value="${cursoSetor}" data-tipo="${tipoAtividade[i]}" data-cpfgestor="${cpfGestor[i]}" data-nomegestor="${nomeGestor[i]}">${cursoSetor}</option>`;
            i++;
        });
        
        if(cursoSetor.length == 1) {
            setorCurso.innerText = 'Setor/Curso: ' + selectCursoSetor.value;
            sessionStorage.setItem('tipoAtividade', tipoAtividade[0]);
            sessionStorage.setItem('cpfGestor', cpfGestor[0]);
            sessionStorage.setItem('nomeGestor', nomeGestor[0]);
        }
        else if(cursoSetor.length > 1 && selectCursoSetor === null) {
            if(sessionStorage.getItem('selectCursoSetor')) {
                selectCursoSetor.value = sessionStorage.getItem('selectCursoSetor');  
            }
            selectTipoAtividade.style.display = 'flex';
            document.documentElement.style.overflow = 'hidden';
        }
        else if(cursoSetor.length > 1 && selectCursoSetor != null) {
            if(sessionStorage.getItem('selectCursoSetor')) {
                selectCursoSetor.value = sessionStorage.getItem('selectCursoSetor');  
            }
            setorCurso.innerText = 'Setor/Curso: ' + sessionStorage.getItem('selectCursoSetor');
        }

        if(document.title == 'Form') {

            //loadAnexos();

            if(correcaoStorage == 'false' && adicionarlocalStorage == 'false') {
                returnToProcessCards.style.display = 'block'
                
                disabled = 'disabled';
                style = 'style="display: none;'
            }
            else {
                btnADD.style.display = 'block';
                deleteTh.style.display = 'table-cell';
                cancelForm.style.display = 'block';
                sendForm.style.display = 'block';
                somenteSalvar.style.display = 'block'
                nomeResponsavel.value = nomeUser.innerHTML;
                departamentoAcessoria.value = cursoSetor;
                nomeGestorForm.value = nomeGestor;
            }
        }

        defineTamanhoDivNomeUser(containerUser, nomeUser);
    })
    .catch(error =>{
        if(error.status != 401) {
            alert(error.message);
        }
        
        document.location.replace(loginPage);
    });
}
