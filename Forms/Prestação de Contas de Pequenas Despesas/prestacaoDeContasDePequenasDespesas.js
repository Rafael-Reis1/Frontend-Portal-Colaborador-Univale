//const baseURL = `http://127.0.0.1:3000`;
const baseURL = `http://192.168.218.26:3000`;
const formsPage = '/';
const loginPage = '../../login.html';
const PrestacaoContas = 'prestacaoDeContasDePequenasDespesas.html'
const formPrestacaoContas = 'formPrestacaoDeContasDePequenasDespesas.html';

window.onload = function() {
    authentication();

    header();

    if (document.title == 'Form process') {
        const newForm = document.getElementById('newForm');
        
        //loadCards();

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
            <input type="text" name="itenAdquiridos" id="itenAdquiridos" class="FormInputs" placeholder="Itens Adquiridos" value="${entrada}" ${disabled}>
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
            <input type="text" name="justCompra" id="justCompra" class="FormInputs" placeholder="Justificativa da Compra" value="${saida}" ${disabled}>
        </td>
        <td ${style}><button class="btnDelete">Delete</button></td>
    </tr>`;
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
