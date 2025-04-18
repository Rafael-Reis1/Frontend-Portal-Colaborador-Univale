const baseURL = `https://portalcolaborador.univale.br/api`;
const formsPage = '/';
const loginPage = '../../login.html';
const PrestacaoContas = 'prestacaoDeContasDePequenasDespesas.html'
const formPrestacaoContas = 'formPrestacaoDeContasDePequenasDespesas.html';
var tipoAtividadeApi = sessionStorage.getItem('tipoAtividade');
var cpfGestorApi = sessionStorage.getItem('cpfGestor');
var nomeGestorApi = sessionStorage.getItem('nomeGestor');
var cpfUser = '';
let disabled = '';
let style = '';

window.onload = function() {
    authentication();

    header();

    initNotfication(false);

    if (document.title == 'Form process') {
        const newForm = document.getElementById('newForm');
        
        loadCards();

        searchForm();
        
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
        const cardId = localStorage.getItem('cardId');
        const token = localStorage.getItem('token');
        const nomeResponsavel =  document.getElementById('nomeResponsavel');
        const departamentoAcessoria = document.getElementById('departamentoAcessoria');
        const nomeGestor = document.getElementById('nomeGestor');
        const dataInicio = document.getElementById('dataInicio');
        const aceitoDeclaracao =  document.getElementById('aceitoDeclaracao');
        const dataFim = document.getElementById('dataFim');
        const cancel = document.getElementById('cancel');
        const tipoAtividade = sessionStorage.getItem('tipoAtividade');

        if(cardId) {
            loadingFullScreen.style.display = 'flex';
            document.documentElement.style.overflow = 'hidden';
            
            axios.post(baseURL + '/process/id', {   
                tipoAtividade: tipoAtividadeApi,
                processInstanceId: cardId,
                processId: 'Prestação de Contas de Pequenas Despesas'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            })
            .then(response => {
                const processos = response.data;
                if(processos.length == 0) {
                    window.location.replace(PrestacaoContas);
                }
                if(tipoAtividade != 'PTA') {
                    window.location.replace(formsPage);
                }
                processos.forEach(processo => {
                    const formFields = processo.formFields;
                    
                    setTimeout(() => {
                        function filtrarEOrdenarPorIndice(array, prefixo) {
                            return array
                            .filter(item => item.field.startsWith(prefixo))
                            .sort((a, b) => {
                                const indiceA = parseInt(a.field.split('___')[1], 10);
                                const indiceB = parseInt(b.field.split('___')[1], 10);
                                return indiceA - indiceB;
                            });
                        }
                        
                        nomeResponsavel.value = formFields.find(item => item.field.startsWith('nomeResponsavel'))?.value || '';
                        departamentoAcessoria.value = formFields.find(item => item.field.startsWith('departamentoAcessoria'))?.value || '';
                        nomeGestor.value = formFields.find(item => item.field.startsWith('nomeGestor'))?.value || '';
                        dataInicio.value = formFields.find(item => item.field.startsWith('dataInicio'))?.value || '';
                        limiteCartao.value = formFields.find(item => item.field.startsWith('limiteCartao'))?.value || '';
                        valorUtilizado.value = formFields.find(item => item.field.startsWith('valorUtilizado'))?.value || '';
                        dataFim.value = formFields.find(item => item.field.startsWith('dataFim'))?.value || '';
                        if(formFields.find(item => item.field.startsWith('aceitoDeclaracao'))?.value || '' === 'checked') {
                            aceitoDeclaracao.checked = true;
                        }
                        const numNotaFiscal = filtrarEOrdenarPorIndice(formFields, 'numNotaFiscal___');
                        const dataCompra = filtrarEOrdenarPorIndice(formFields, 'dataCompra___');
                        const itenAdquiridos = filtrarEOrdenarPorIndice(formFields, 'itenAdquiridos___');
                        const quantidade = filtrarEOrdenarPorIndice(formFields, 'quantidade___');
                        const valorNota = filtrarEOrdenarPorIndice(formFields, 'valorNota___');
                        const justCompra = filtrarEOrdenarPorIndice(formFields, 'justCompra___');
                        
                        for (let i = 0; i < numNotaFiscal.length; i++) {
                                const novaLinha = tableRows(
                                numNotaFiscal[i]?.value || '',
                                dataCompra[i]?.value || '',
                                itenAdquiridos[i]?.value || '',
                                quantidade[i]?.value || '',
                                valorNota[i]?.value || '',
                                justCompra[i]?.value || '',
                                disabled,
                                style
                            );
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
                    }, 0);
                });
    
                loadingFullScreen.style.display = 'none';
                document.body.style.overflow = 'auto';
            })
            .catch(erro => {
                console.error(erro);
            });
            
            cancel.onclick = function() {
                localStorage.setItem('correcao', 'false');
                localStorage.setItem('adicionar', 'true');
                sendFormApi(tabela, false, true);
            }
        }
        else {
            cancel.onclick = function() {
                history.back();
            }
        }

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
                input.addEventListener('input', calcularTotal); // Usando 'input' em vez de 'change'
                input.setAttribute('data-listener-adicionado', 'true'); // Marca o input para não adicionar o listener novamente.
            });
        
            calcularTotal(); // Recalcula o total após adicionar a linha
        
            // Aplica a máscara aos inputs existentes
            const inputsExistentes = document.querySelectorAll('#valorNota');
            inputsExistentes.forEach(input => {
                aplicarMascara(input);
            });
        
            const novoInputValorNota = tabela.querySelector('#valorNota:last-of-type');
        
            novoInputValorNota.addEventListener('input', function(e) { // Usando 'input' em vez de 'keyup'
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
            document.documentElement.scrollTop = 0;
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
            document.documentElement.scrollTop = 0;
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
          
            if (total > parseFloat(document.getElementById('limiteCartao').value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'))) {
                document.getElementById('valorUtilizado').style.border = '1px solid red';
                document.getElementById('valorUtilizado').style.background = 'red';
            }
            else {
                document.getElementById('valorUtilizado').style.border = '1px solid var(--border-color)';
                document.getElementById('valorUtilizado').style.background = 'var(--form-paper-background-color)';
            }
            document.getElementById('valorUtilizado').value = formattedTotal;
        }
        
        // Chama a função calcularTotal() inicialmente.
        calcularTotal();
    }
}

function tableRows(nomeResponsavel, departamentoAcessoria, nomeGestor, dataInicio, valorUtilizado, justCompra, disabled, style) {
    return `<tr>
        <td>
            <label for="numNotaFiscal" class="tableLabels" style="display: none;">N° da Nota Fiscal/Cupom</label>
            <input type="number" name="numNotaFiscal" id="numNotaFiscal" class="FormInputs" placeholder="N° nota fiscal" value="${nomeResponsavel}" ${disabled}>
        </td>
        <td>
            <label for="dataCompra" class="tableLabels" style="display: none;">Aula e/ou Atividade</label>
            <input type="date" name="dataCompra" id="dataCompra" class="FormInputs" value="${departamentoAcessoria}" ${disabled}>
        </td>
        <td>
            <label for="itenAdquiridos" class="tableLabels" style="display: none;">Itens Adquiridos</label>
            <textarea type="text" name="itenAdquiridos" id="itenAdquiridos" class="FormInputs" placeholder="Itens Adquiridos" rows="1" ${disabled} style="max-width: 12.5rem; min-width: 12.5rem">${nomeGestor}</textarea>
        </td>
        <td>
            <label for="quantidade" class="tableLabels" style="display: none;">Saída para o Intervalo</label>
            <input type="number" name="quantidade" id="quantidade" class="FormInputs" placeholder="Quant." value="${dataInicio}" ${disabled}>
        </td>
        <td>
            <label for="valorNota" class="tableLabels" style="display: none;">Valor da Nota (R$)</label>
            <input type="text" name="valorNota" id="valorNota" class="FormInputs" value="${valorUtilizado}" ${disabled}>
        </td>
        <td>
            <label for="justCompra" class="tableLabels" style="display: none;">Justificativa da Compra</label>
            <textarea type="text" name="justCompra" id="justCompra" class="FormInputs" placeholder="Justificativa da Compra" rows="1" ${disabled} style="max-width: 18.75rem; min-width: 18.75rem">${justCompra}</textarea>
        </td>
        <td ${style}><button class="btnDelete">Delete</button></td>
    </tr>`;
}

async function sendFormApi(tabela, somenteSalvar, cancel) {
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
    const btnADD = document.getElementById('btnADD');

    if(somenteSalvar) {
        formataRequisicao();
    }
    else {
        if(validateForm(linhas, nomeResponsavel, departamentoAcessoria, nomeGestor, dataInicio, dataFim, limiteCartao, 
            valorUtilizado, btnADD
        )) {
            formataRequisicao();
        }
        else {
            sendFormPopup.style.opacity = 0;

            setTimeout(() => {
                sendFormPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 200);
            return false;
        }
    }

    function formataRequisicao() {
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
        formIds.push('cpfSolicitante');
        formData.push(cpfUser);
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
        let targetState;
    
        if(cancel) {
            targetState = 19;
        }
        else {
            targetState = 2;
        }
        
    
        if (cardId == null) {
            //Ids campos, dados campos, ids e dados textAreas, é somente salvar?, tokenUser
            //Proxima atividade, nome formulário, cpf do gestor, nome do gestor
            //tipo atividade pta/professor, passar para proxima atividade?, tipo setor, proxima pagina
            processStart(formIds, formData, textAreaData, somenteSalvar, token, 
                targetState, 'Prestação de Contas de Pequenas Despesas', cpfGestorApi, nomeGestorApi, 
                tipoAtividadeApi, 'false', 'RH', PrestacaoContas, 1);
        }
        else if (cardId != null) {
            processUpdate(cardId, formIds, formData, textAreaData, somenteSalvar, token,
                cpfGestorApi, 8, 'Prestação de Contas de Pequenas Despesas', 'RH', targetState, PrestacaoContas, cancel);
        }
    }
}

function validateForm(linhas, nomeResponsavel, departamentoAcessoria, nomeGestor, dataInicio, dataFim, limiteCartao,
    valorUtilizado, btnADD
) {
    let i = 0;
    for (let j = 0; j < linhas.length; j++) {
        i++;
    }
    if (i < 2) {
        openToast('Deve preencher ao menos uma despesa!', 'warning', 5000);
        //alert('Deve preencher ao menos uma despesa!');
        btnADD.focus();
        return false;
    }
    if(nomeResponsavel.value == '') {
        openToast('Deve preencher seu nome!', 'warning', 5000);
        //alert('Deve preencher seu nome!');
        nomeResponsavel.style.background = 'red';
        nomeResponsavel.focus();
        return false;
    }
    if(departamentoAcessoria.value == '') {
        openToast('Deve preencher seu departamento/assessoria!', 'warning', 5000);
        //alert('Deve preencher seu departamento/assessoria!');
        departamentoAcessoria.style.background = 'red';
        departamentoAcessoria.focus();
        return false;
    }
    if(nomeGestor.value == '') {
        openToast('Deve preencher o nome do gestor!', 'warning', 5000);
        //alert('Deve preencher o nome do gestor!');
        nomeGestor.style.background = 'red';
        nomeGestor.focus();
        return false;
    }
    if(dataInicio.value == '') {
        openToast('Deve selecionar a data de início!', 'warning', 5000);
        //alert('Deve selecionar a data de início!');
        dataInicio.style.background = 'red';
        dataInicio.focus();
        return false;
    }
    if(dataFim.value == '') {
        openToast('Deve selecionar a data de fim!', 'warning', 5000);
        //alert('Deve selecionar a data de fim!');
        dataFim.style.background = 'red';
        dataFim.focus();
        return false;
    }
    if(limiteCartao.value == 'R$ ') {
        openToast('Deve preencher o limite do cartão!', 'warning', 5000);
        //alert('Deve preencher o limite do cartão!');
        limiteCartao.style.background = 'red';
        limiteCartao.focus();
        return false;
    }
    if(valorUtilizado.value == 'R$ ') {
        openToast('Deve preencher o valor utilizado!', 'warning', 5000);
        //alert('Deve preencher o valor utilizado!');
        valorUtilizado.style.background = 'red';
        valorUtilizado.focus();
        return false;
    }
    if (parseFloat(limiteCartao.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')) < parseFloat(valorUtilizado.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'))) {
        openToast('O valor utilizado deve ser menor que o limite do cartão!', 'warning', 5000);
        //alert('O valor utilizado deve ser menor que o limite do cartão!');
        valorUtilizado.style.background = 'red';
        valorUtilizado.focus();
        return false;
    }

    return true;
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
            const activity = processo.activity;
            
            
            if (activity == 1) {
                cardsRascunho.style.display = 'flex';
                populateCards(processo, 'bodyCardsRascunho', formPrestacaoContas);
            }
            if (activity == 6) {
                cardsCorrecao.style.display = 'flex';
                populateCards(processo, 'bodyCardsCorreção', formPrestacaoContas);
            }
            if (activity == 2) {
                cardsAprovGestor.style.display = 'flex';
                populateCards(processo, 'bodyCardsAprovGestor', formPrestacaoContas);
            }
            if (activity == 10) {
                cardsAprovFinanceiro.style.display = 'flex';
                populateCards(processo, 'cardsAprovFinanceiro', formPrestacaoContas);
            }  
            if (activity == 13) {
                cardsAprovControladoria.style.display = 'flex';
                populateCards(processo, 'cardsAprovControladoria', formPrestacaoContas);
            }     
            if (activity == 16) {
                cardsAprovados.style.display = 'flex';
                populateCards(processo, 'bodyCardsAprovados', formOcorrenciasPonto);
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
    const somenteSalvar =  document.getElementById('somenteSalvar');
    const deleteTh = document.getElementById('deleteTh');
    const btnADD = document.getElementById('btnADD');
    const nomeGestorForm = document.getElementById('nomeGestor');
    const selectTipoAtividade = document.getElementById('selectTipoAtividade');
    const containerUser = document.getElementById('containerUser');
    const nomeResponsavel = document.getElementById('nomeResponsavel');
    const departamentoAcessoria = document.getElementById('departamentoAcessoria');
    const dataInicio =  document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');
    const limiteCartao = document.getElementById('limiteCartao');
    const valorUtilizado = document.getElementById('valorUtilizado');

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
        const tipoFuncionario = response.data.tipoFuncionario;
        const cpfGestor = response.data.cpfGestor;
        const nomeGestor = response.data.nomeGestor;
        cpfUser = response.data.cpf;
       
        let i = 0;
         
        cursoSetor.forEach(cursoSetor => {
            selectCursoSetor.innerHTML += `<option value="${cursoSetor}" data-tipo="${tipoAtividade[i]}" data-cpfgestor="${cpfGestor[i]}" data-nomegestor="${nomeGestor[i]}" data-tipoFunc="${tipoFuncionario[i]}">${cursoSetor}</option>`;
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
            if(correcaoStorage == 'false' && adicionarlocalStorage == 'false') {
                nomeResponsavel.disabled = true;
                departamentoAcessoria.disabled = true;
                nomeGestorForm.disabled = true;
                dataInicio.disabled = true;
                dataFim.disabled = true;
                limiteCartao.disabled = true;
                valorUtilizado.disabled = true;
                
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
                departamentoAcessoria.value = selectCursoSetor.value;
                nomeGestorForm.value = nomeGestorApi;
            }
        }

        defineTamanhoDivNomeUser(containerUser, nomeUser);
    })
    .catch(error =>{
        if(error.status != 401) {
            openToast(error.message, "erro", 5000000, (result) => {
                if (result) {
                    document.location.replace(loginPage);
                }
            });
            //alert(error.message);
        }
        else {
            document.location.replace(loginPage);
        }
    });
}
