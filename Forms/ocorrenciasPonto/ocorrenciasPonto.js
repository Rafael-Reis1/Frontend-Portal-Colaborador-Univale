//const baseURL = `http://127.0.0.1:3000`;
const baseURL = `http://192.168.218.26:3000`;
const formsPage = '/';
const loginPage = '../../login.html';
const ocorrenciasPonto = 'ocorrenciasPonto.html'
const formOcorrenciasPonto = 'formOcorrenciasPonto.html';
var tipoAtividadeApi = sessionStorage.getItem('tipoAtividade');
var cpfGestorApi = sessionStorage.getItem('cpfGestor');
var nomeGestorApi = sessionStorage.getItem('nomeGestor');
let disabled = '';
let style = '';
let completeTask = '';
let attachmentsQTDE = 0;

window.onload = function() {
    const fileInput = document.getElementById('file-input');
    const selectedFiles = new Map();

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
            document.location.href = formOcorrenciasPonto;
        }
    }
    if (document.title == 'Form') {
        const token = localStorage.getItem('token');
        const tabela = document.querySelector('table');
        const btnADD = document.getElementById('btnADD');
        const cancelForm = document.getElementById('cancelForm');
        const cancelFormPopup = document.getElementById('cancelFormPopup');
        const cancelBackgroud = document.getElementById('cancelBackgroud');
        const dontCancel = document.getElementById('dontCancel');
        const sendForm = document.getElementById('sendForm');
        const sendFormPopup = document.getElementById('sendFormPopup');
        const sendBackgroud = document.getElementById('sendBackgroud');
        const btnCorrigir = document.getElementById('btnCorrigir');
        const btnEnviar = document.getElementById('btnEnviar');
        const cardId = localStorage.getItem('cardId');
        const nome = document.getElementById('nome');
        const funcao = document.getElementById('funcao');
        const cursoSetor = document.getElementById('cursoSetor');
        const obs = document.getElementById('obs');
        const relato = document.getElementById('relato');
        const returnToProcessCards = document.getElementById('returnToProcessCards');
        const enviarPara = document.getElementById('enviarPara');
        const somenteSalvar = document.getElementById('somenteSalvar');
        const loadingFullScreen = document.getElementById('loadingFullScreen');
        const formAttachment =  document.getElementById('formAttachment');
        const formAttachmentPopup = document.getElementById('formAttachmentPopup');
        const formAttachmentBackgroud = document.getElementById('formAttachmentBackgroud');
        const btnConfirmarAttachment = document.getElementById('btnConfirmarAttachment');
        const attachmentsQTDEicon = document.getElementById('attachmentsQTDEicon');

        attachmentsQTDEicon.innerHTML = attachmentsQTDE;

        if(cardId) {
            loadingFullScreen.style.display = 'flex';
            document.documentElement.style.overflow = 'hidden';

            axios.post(baseURL + '/process/id', {   
                tipoAtividade: tipoAtividadeApi,
                processInstanceId: cardId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            })
            .then(response => {
                const processos = response.data;
                if(processos.length == 0) {
                    window.location.replace(ocorrenciasPonto);
                }
                processos.forEach(processo => {
                    const formFields = processo.formFields;
                    
                    const radioTypes = formFields.filter(item => item.field.startsWith('radioTypes'));
                    if (radioTypes[0].value) {
                        document.querySelector(`input[value=${radioTypes[0].value}]`).checked = true;
                    }
                    
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
                        
                        nome.value = formFields.find(item => item.field.startsWith('nome'))?.value || '';
                        funcao.value = formFields.find(item => item.field.startsWith('funcao'))?.value || '';
                        cursoSetor.value = formFields.find(item => item.field.startsWith('cursoSetor'))?.value || '';
                        obs.value = formFields.find(item => item.field.startsWith('obs'))?.value || '';
                        relato.value = formFields.find(item => item.field.startsWith('relato'))?.value || '';
                        
                        const dataOcorrencia = filtrarEOrdenarPorIndice(formFields, 'dataOcorrencia___');
                        const atividade = filtrarEOrdenarPorIndice(formFields, 'atividade___');
                        const entrada = filtrarEOrdenarPorIndice(formFields, 'entrada___');
                        const saidaIntervalo = filtrarEOrdenarPorIndice(formFields, 'saidaIntervalo___');
                        const entradaIntervalo = filtrarEOrdenarPorIndice(formFields, 'entradaIntervalo___');
                        const saida = filtrarEOrdenarPorIndice(formFields, 'saida___');
                        
                        for (let i = 0; i < dataOcorrencia.length; i++) {
                                const novaLinha = tableRows(
                                dataOcorrencia[i]?.value || '',
                                atividade[i]?.value || '',
                                entrada[i]?.value || '',
                                saidaIntervalo[i]?.value || '',
                                entradaIntervalo[i]?.value || '',
                                saida[i]?.value || '',
                                disabled,
                                style
                            );
                            tabela.insertAdjacentHTML('beforeend', novaLinha);
                        }
                    }, 0);
                });

                loadingFullScreen.style.display = 'none';
                document.body.style.overflow = 'auto';
            })
            .catch(erro => {
                console.error(erro);
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

        returnToProcessCards.onclick = function() {
            document.body.style.overflow = 'auto';
            document.location.replace(ocorrenciasPonto);
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
            completeTask = 'false';
            sendFormApi(tabela, false);
        }

        somenteSalvar.onclick = function() {
            completeTask = 'false';
            loadingFullScreen.style.display = 'flex';
            localStorage.setItem('correcao', 'false');
            localStorage.setItem('adicionar', 'true');
            sendFormApi(tabela, true);
        }

        tabela.onclick = function(e) {
            if (!e.target.classList.contains('btnDelete')) {
                return
            }

            e.target.closest('tr').remove();
        }

        btnADD.onclick = function() {
            const novaLinha = tableRows('', '', '', '', '', '', '', '');
            tabela.insertAdjacentHTML('beforeend', novaLinha);
            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
            const dia = String(hoje.getDate()).padStart(2, '0');

            // Formata no padrão AAAA-MM-DD
            const dataMaxima = `${ano}-${mes}-${dia}`;

            // Seleciona todos os inputs da classe "data-ocorrencia"
            const inputs = document.querySelectorAll('.dataOcorrencia');

            // Aplica o atributo "max" para cada input
            inputs.forEach(input => {
                input.setAttribute('max', dataMaxima);
            });
        }

        formAttachment.onclick = function() {
            document.documentElement.scrollTop = 0;
            formAttachmentPopup.style = 'flex';
            document.documentElement.style.overflow = 'hidden';
        }

        formAttachmentBackgroud.onclick = function() {
            formAttachmentPopup.style.opacity = 0;

            setTimeout(() => {
                formAttachmentPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 200);
        }

        btnConfirmarAttachment.onclick = function() {
            formAttachmentPopup.style.opacity = 0;

            setTimeout(() => {
                formAttachmentPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 200);
        }

        adicionarAttachments();
    }

    function tableRows(dataOcorrencia, atividade, entrada, saidaIntervalo, entradaIntervalo, saida, disabled, style) {
        return `<tr>
            <td>
                <label for="dataOcorrencia" class="tableLabels" style="display: none;">Data</label>
                <input type="date" name="dataOcorrencia" id="dataOcorrencia" class="FormInputs dataOcorrencia" value="${dataOcorrencia}" ${disabled}>
            </td>
            <td>
                <label for="atividade" class="tableLabels" style="display: none;">Aula e/ou Atividade</label>
                <input type="text" name="atividade" id="atividade" class="FormInputs" placeholder="Digite a atividade" value="${atividade}" ${disabled}>
            </td>
            <td>
                <label for="entrada" class="tableLabels" style="display: none;">Entrada</label>
                <input type="time" name="entrada" id="entrada" class="FormInputs" value="${entrada}" ${disabled}>
            </td>
            <td>
                <label for="saidaIntervalo" class="tableLabels" style="display: none;">Saída para o Intervalo</label>
                <input type="time" name="saidaIntervalo" id="saidaIntervalo" class="FormInputs" value="${saidaIntervalo}" ${disabled}>
            </td>
            <td>
                <label for="entradaIntervalo" class="tableLabels" style="display: none;">Entrada do Intervalo</label>
                <input type="time" name="entradaIntervalo" id="entradaIntervalo" class="FormInputs" value="${entradaIntervalo}" ${disabled}>
            </td>
            <td>
                <label for="saida" class="tableLabels" style="display: none;">Saída</label>
                <input type="time" name="saida" id="saida" class="FormInputs" value="${saida}" ${disabled}>
            </td>
            <td ${style}><button class="btnDelete">Delete</button></td>
        </tr>`;
    }

    async function sendFormApi(tabela, somenteSalvar) {
        const token = localStorage.getItem('token');
        const linhas = tabela.querySelectorAll('tr');
        const nome = document.getElementById('nome');
        const funcao = document.getElementById('funcao');
        const cursoSetor = document.getElementById('cursoSetor');
        const obs = document.getElementById('obs');
        const cardId = localStorage.getItem('cardId');

        const radioButtons = document.querySelectorAll('#radioButtonsTipoJus input[type="radio"]');
        let valorSelecionado;

        radioButtons.forEach(radio => {
            if (radio.checked) {
                valorSelecionado = radio.value;
            }
        });

        let formIds = [];
        let formData = [];
    
        formIds.push('nome');
        formData.push(nome.value);
        formIds.push('funcao');
        formData.push(funcao.value);
        formIds.push('cursoSetor');
        formData.push(cursoSetor.value);
        let data = {
            obs: obs.value
        }
        let textAreaData = JSON.stringify(data);
        formIds.push('radioTypes');
        if(valorSelecionado == undefined) {
            valorSelecionado = '';
        }
        formData.push(valorSelecionado);
    
        let col = -1;
        linhas.forEach(linha => {
            col++;
            const colunas = linha.querySelectorAll('td');
            const inputs = linha.querySelectorAll('input');
           
            colunas.forEach((coluna, index) => {
                if (index != 6) {
                      if (inputs[index]) {
                          if (index == 0) {
                              formIds.push('dataOcorrencia___' + col);
                              formData.push(inputs[index].value);
                          }
                          if (index == 1) {
                              formIds.push('atividade___' + col);
                              formData.push(inputs[index].value);
                          }
                          if (index == 2) {
                              formIds.push('entrada___' + col);
                              formData.push(inputs[index].value);
                          }
                          if (index == 3) {
                              formIds.push('saidaIntervalo___' + col);
                              formData.push(inputs[index].value);
                          }
                          if (index == 4) {
                              formIds.push('entradaIntervalo___' + col);
                              formData.push(inputs[index].value);
                          }
                          if (index == 5) {
                              formIds.push('saida___' + col);
                              formData.push(inputs[index].value);
                          }
                      }
                  }
              });
        });

        if (cardId == null) {
            processStart(formIds, formData, textAreaData, somenteSalvar, token);
        }
        else if (cardId != null) {
            processUpdate(cardId, formIds, formData, textAreaData, somenteSalvar, token);
        }
    }

    function processStart(formIds, formData, textAreaData, somenteSalvar, token) {
        const loadingFullScreen = document.getElementById('loadingFullScreen');

        loadingFullScreen.style.display = 'flex';
        document.documentElement.style.overflow = 'hidden';
        let targetState

        if (tipoAtividadeApi == 'PTA') {
            targetState = 5;
        }
        else if (tipoAtividadeApi == 'PROFESSOR') {
            targetState = 23;
        }

        axios.post(baseURL + `/process/start`, {
            targetState: targetState,
            processId: 'Ocorrências de ponto',
            colleagueIds: [cpfGestorApi],
            nomeGestor: nomeGestorApi,
            cpfGestor: cpfGestorApi,
            tipoAtividade: tipoAtividadeApi,
            formIds: formIds,
            formData: formData,
            textAreaData,
            completeTask: completeTask
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            if(response.data[0] == "ERROR") {
                loadingFullScreen.style.display = 'none'
                document.body.style.overflow = 'auto';
                alert(response.data[1]);
            }
            else {
                if(somenteSalvar) {
                    loadingFullScreen.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    document.location.replace(ocorrenciasPonto);
                }
                else {
                    document.body.style.overflow = 'auto';
                    localStorage.setItem('correcao', 'true');
                    localStorage.setItem('adicionar', 'false');
                    enviarAttachment(response.data, formIds, formData, textAreaData);
                }
            }
        })
        .catch(error =>{
            alert(JSON.stringify(error.response.data, null, 2) + 'teste');
            document.body.style.overflow = 'auto';
            loadingFullScreen.style.display = 'none'
        });
    }

    function processUpdate(cardId, formIds, formData, textAreaData, somenteSalvar, token) {
        const loadingFullScreen = document.getElementById('loadingFullScreen');
        const ocorrenciasPontoFolderId = 8;

        loadingFullScreen.style.display = 'flex';
        document.documentElement.style.overflow = 'hidden';

        axios.put(baseURL + `/process/update`, {
            processInstanceId: cardId,
            colleagueIds: [cpfGestorApi],
            formIds: formIds,
            formData: formData,
            textAreaData,
            forlderId: ocorrenciasPontoFolderId
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            if(somenteSalvar) {
                loadingFullScreen.style.display = 'none';
                document.body.style.overflow = 'auto';
                document.location.replace(ocorrenciasPonto);
            }
            else {
                enviarAttachment(cardId, formIds, formData, textAreaData);
            }
        })
        .catch(error =>{
            loadingFullScreen.style.display = 'none';
            document.body.style.overflow = 'auto';
            alert(error.response.data.message.replace(/[{}]/g, ''));
        });
    }

    function enviarAttachment(processInstanceId, formIds, formDataJson, textAreaData) {
        const formData = new FormData();
        const token = localStorage.getItem('token');

        // Adicionar todos os arquivos de `selectedFiles` ao FormData
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });
    
        const jsonData = {
            key: processInstanceId,
            value: 'Ocorrências de ponto',
            key2: tipoAtividadeApi,
            value2: 'RH'
        };
        formData.append('json', JSON.stringify(jsonData));
        
        // Enviar os arquivos via Axios
        axios.post(baseURL + '/process/attachments', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        })
        .then(response => {
            formIds.push('attachmentId');
            formDataJson.push(response.data);
            moveRequest(processInstanceId, formIds, formDataJson, textAreaData);
        })
        .catch(error => {
            console.error('Erro ao enviar arquivos', error);
        });
    }

    function moveRequest(processInstanceId, formIds, formData, textAreaData) {
        const token = localStorage.getItem('token');
        const cardId = localStorage.getItem('cardId');
        const loadingFullScreen = document.getElementById('loadingFullScreen');

        loadingFullScreen.style.display = 'flex';
        document.documentElement.style.overflow = 'hidden';
        let targetState = 0;

        if (tipoAtividadeApi == 'PTA') {
            targetState = 5;
        }
        else if (tipoAtividadeApi == 'PROFESSOR') {
            targetState = 23;
        }

        let processInstanceIdApi = '';

        if(cardId == null) {
            processInstanceIdApi = processInstanceId;
        }
        else {
            processInstanceIdApi = cardId;
        }

        axios.post(baseURL + `/process/move`, {
            processInstanceId: processInstanceIdApi,
            targetState: targetState,
            colleagueIds: [cpfGestorApi],
            formIds: formIds,
            formData: formData,
            textAreaData
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            loadingFullScreen.style.display = 'none';
            document.body.style.overflow = 'auto';
            document.location.replace(ocorrenciasPonto);
        })
        .catch(error =>{
            //alert(JSON.stringify(error.response.data, null, 2));
            loadingFullScreen.style.display = 'none';
            document.body.style.overflow = 'auto';
            alert(error.response.data.message.replace(/[{}]/g, ''));
        });
    }
    
    //Faz a pagina ser uma pagina que so pode ter acesso por autenticação
    function authentication() {
        const token = localStorage.getItem('token');
        const nomeUser = document.getElementById('nomeUser');
        const setorCurso = document.getElementById('setorCurso');
        const selectCursoSetor = document.getElementById('selectCursoSetor');
        const inputsRadio = document.querySelectorAll('input[type="radio"]');
        const adicionarlocalStorage = localStorage.getItem('adicionar');
        const deleteTh = document.getElementById('deleteTh');
        const correcaoStorage = localStorage.getItem('correcao');
        const nome = document.getElementById('nome');
        const funcao = document.getElementById('funcao');
        const obs = document.getElementById('obs');
        const relato = document.getElementById('relato');
        const btnADD = document.getElementById('btnADD');
        const cancelForm = document.getElementById('cancelForm');
        const sendForm = document.getElementById('sendForm');
        const returnToProcessCards = document.getElementById('returnToProcessCards');
        const cursoSetorForm = document.getElementById('cursoSetor');
        const somenteSalvar =  document.getElementById('somenteSalvar');
        const fileUploadArea = document.getElementById('file-upload');

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
            tipoFuncionario = response.data.tipoFuncionario;
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

                loadAnexos();

                if(correcaoStorage == 'false' && adicionarlocalStorage == 'false') {
                    nome.disabled = true;
                    funcao.disabled = true;
                    cursoSetorForm.disabled = true;
                    obs.disabled = true;
                    relato.disabled = true;
                    returnToProcessCards.style.display = 'block'
                    fileUploadArea.style.display = 'none';
                    
                    disabled = 'disabled';
                    style = 'style="display: none;'
        
                    inputsRadio.forEach((input) => {
                        input.disabled = true;
                    });
                }
                else {
                    btnADD.style.display = 'block';
                    cancelForm.style.display = 'block';
                    sendForm.style.display = 'block';
                    somenteSalvar.style.display = 'block'
                    deleteTh.style.display = 'table-cell';
                    cursoSetorForm.value = cursoSetor;
                    nome.value = nomeUser.innerHTML;
                    funcao.value = tipoFuncionario;
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
    
    function loadAnexos() {
        const token = localStorage.getItem('token');
        const cardId = localStorage.getItem('cardId');
        const fileListContainer = document.getElementById('file-list');

        axios.get(baseURL + `/process/attachments/${cardId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        })
        .then(response => {
            if(response.data.length > 0) {
                response.data.forEach(item => {
                    criaListaAttachment(fileListContainer, '', 'api', item.documentDescription, item.fileUrl);
                });
            } 
        })
        .catch(error => {
            alert(error.message);
        });
    }

    function loadCards() {
        const token = localStorage.getItem('token');
        const bodyCardsAprovGestor = document.getElementById('bodyCardsAprovGestor');
        const cardsAprovGestor = document.getElementById('cardsAprovGestor');
        const bodyCardsAprovRH = document.getElementById('bodyCardsAprovRH');
        const cardsAprovRH = document.getElementById('cardsAprovRH');
        const cardsAprovados = document.getElementById('cardsAprovados');
        const bodyCardsCorreção = document.getElementById('bodyCardsCorreção');
        const cardsCorrecao = document.getElementById('cardsCorrecao');
        const cardsAprovCoordenador = document.getElementById('cardsAprovCoordenador');
        const bodyCardsCoordenador = document.getElementById('bodyCardsCoordenador');
        const cardsAprovSeplac = document.getElementById('cardsAprovSeplac');
        const bodyCardsSeplac = document.getElementById('bodyCardsSeplac');
        const cardsAprovDiretoria = document.getElementById('cardsAprovDiretoria');
        const bodyCardsDiretoria = document.getElementById('bodyCardsDiretoria');
        const cardsAprovProReitoria = document.getElementById('cardsAprovProReitoria');
        const bodyCardsProReitoria = document.getElementById('bodyCardsProReitoria');
        const cardsSkeleton = document.getElementById('cardsSkeleton');
        const cardsRascunho = document.getElementById('cardsRascunho');
        const bodyCardsRascunho = document.getElementById('bodyCardsRascunho');
        bodyCardsAprovGestor.innerHTML = '';
        bodyCardsAprovRH.innerHTML = '';
        bodyCardsCorreção.innerHTML = '';
        bodyCardsCoordenador.innerHTML = '';
        bodyCardsSeplac.innerHTML = '';
        bodyCardsDiretoria.innerHTML = '';
        bodyCardsProReitoria.innerHTML = '';
        bodyCardsRascunho.innerHTML = '';
    
        axios.post(baseURL + '/process/all', {
            tipoAtividade: tipoAtividadeApi
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
            
            if (ultimoMovimento.state.stateName == 'Início' && ultimoMovimento.active == true) {
                cardsRascunho.style.display = 'flex';
                populateCards(ultimoMovimento, 'bodyCardsRascunho');
            }
            if (ultimoMovimento.state.stateName == 'Correção' && ultimoMovimento.active == true) {
                cardsCorrecao.style.display = 'flex';
                populateCards(ultimoMovimento, 'bodyCardsCorreção');
            }
            if (ultimoMovimento.state.stateName == 'Aprovação gestor' && ultimoMovimento.active == true) {
                cardsAprovGestor.style.display = 'flex';
                populateCards(ultimoMovimento, 'bodyCardsAprovGestor');
            }
            if (ultimoMovimento.state.stateName == 'Aprovação RH' && ultimoMovimento.active == true) {
                cardsAprovRH.style.display = 'flex';
                populateCards(ultimoMovimento, 'bodyCardsAprovRH');
            }
            if (ultimoMovimento.state.stateName == 'Aprovação coordenador' && ultimoMovimento.active == true) {
                cardsAprovCoordenador.style.display = 'flex';
                populateCards(ultimoMovimento, 'bodyCardsCoordenador');
            }
            if (ultimoMovimento.state.stateName == 'Aprovação Seplac' && ultimoMovimento.active == true) {
                cardsAprovSeplac.style.display = 'flex';
                populateCards(ultimoMovimento, 'bodyCardsSeplac');
            }
            if (ultimoMovimento.state.stateName == 'Aprovação diretoria' && ultimoMovimento.active == true) {
                cardsAprovDiretoria.style.display = 'flex';
                populateCards(ultimoMovimento, 'bodyCardsDiretoria');
            }
            if (ultimoMovimento.state.stateName == 'Aprovação pro reitoria' && ultimoMovimento.active == true) {
                cardsAprovProReitoria.style.display = 'flex';
                populateCards(ultimoMovimento, 'bodyCardsProReitoria');
            }
            if (ultimoMovimento.state.stateName == 'Fim') {
                cardsAprovados.style.display = 'flex';
                populateCards(ultimoMovimento, 'bodyCardsAprovados');
            }            
          });
        })
        .catch(erro => {
          console.error(erro);
        });
    }

    function populateCards(dados, bodyCardsName) {
        const bodyCard = document.getElementById(bodyCardsName);
        
        const fragment = document.createDocumentFragment();
      
        const card = document.createElement('div');
        card.classList.add(bodyCardsName);
        card.dataset.id = dados.processInstanceId;
        
        card.innerHTML = `
            <div class="cardSituation">
                <p>Solicitação: ${dados.processInstanceId}</p>
            </div>
        `; 
    
        card.addEventListener('click', () => {
            localStorage.setItem('cardId', card.dataset.id);
            if(bodyCardsName == 'bodyCardsCorreção' || bodyCardsName == 'bodyCardsRascunho') {
                localStorage.setItem('correcao', 'true');
                localStorage.setItem('adicionar', 'false');
            }
            else {
                localStorage.setItem('correcao', 'false');
                localStorage.setItem('adicionar', 'false');
            }
            document.location.href = formOcorrenciasPonto;
        });
    
        fragment.appendChild(card);
        
        bodyCard.appendChild(fragment);
    }

    function adicionarAttachments() {
        const fileListContainer = document.getElementById('file-list');
        const fileUploadArea = document.getElementById('file-upload');
    
        // Função para adicionar arquivos à lista
        function addFileToList(file) {
            if (selectedFiles.has(file.name)) {
                alert('Este arquivo já foi selecionado!');
                return;
            }
    
            selectedFiles.set(file.name, file); // Armazena o arquivo completo no Map
    
            criaListaAttachment(fileListContainer, file, "upload");
        }
    
        // Quando o usuário seleciona arquivos
        fileInput.addEventListener('change', function () {
            Array.from(fileInput.files).forEach(file => addFileToList(file)); // Processa todos os arquivos selecionados
            fileInput.value = ''; // Limpa o input para permitir nova seleção
        });
    
        // Evento de arraste para dentro da área de upload
        fileUploadArea.addEventListener('dragover', function (event) {
            event.preventDefault(); // Impede o comportamento padrão
            fileUploadArea.style.backgroundColor = '#e0f7e0'; // Indica que o arquivo pode ser solto
        });
    
        fileUploadArea.addEventListener('dragleave', function () {
            fileUploadArea.style.backgroundColor = '#f9f9f9'; // Volta ao estilo original
        });
    
        // Quando o arquivo é solto
        fileUploadArea.addEventListener('drop', function (event) {
            event.preventDefault(); // Impede o comportamento padrão
            Array.from(event.dataTransfer.files).forEach(file => addFileToList(file)); // Processa todos os arquivos arrastados
            fileUploadArea.style.backgroundColor = '#f9f9f9'; // Volta ao estilo original
        });
    }

    function criaListaAttachment(fileListContainer, file, source, documentDescription, fileUrl) {
        const attachmentsQTDEicon = document.getElementById('attachmentsQTDEicon');

        // Cria o item de lista com ícone
        const li = document.createElement('li');
    
        // Ícone do arquivo
        const icon = document.createElement('span');
        icon.classList.add('file-icon');
        icon.textContent = '📄';

        const fileName = document.createElement('span');
        fileName.classList.add('file-name');

        let actionIcon; // Ícone de ação (excluir ou baixar)
        if (source === 'upload') {
            // Nome do arquivo
            fileName.textContent = file.name;
            // Ícone de excluir
            actionIcon = document.createElement('span');
            actionIcon.classList.add('remove-icon');
            actionIcon.textContent = '❌';
            actionIcon.addEventListener('click', function () {
                selectedFiles.delete(file.name); // Remove o arquivo do Map
                attachmentsQTDE--;
                if(attachmentsQTDE == 0) {
                    semAnexo.style.display = 'inline';
                }
                attachmentsQTDEicon.innerHTML = attachmentsQTDE;
                li.remove(); // Remove o elemento da lista
            });
        } else if (source === 'api') {
            /// Ícone de baixar
            fileName.textContent = documentDescription; // adicionar nome que vem da API

            actionIcon = document.createElement('span');
            actionIcon.classList.add('download-icon');
            actionIcon.textContent = '⬇️';

            // Adicionar evento de clique para redirecionar
            actionIcon.addEventListener('click', function () {
                window.open(fileUrl, '_blank'); // Substitua 'file.url' pela URL que você vai passar
            });

            // Adicionar o ícone ao DOM
            document.body.appendChild(actionIcon);
        }

        li.appendChild(icon);
        li.appendChild(fileName);
        li.appendChild(actionIcon);

        semAnexo.style.display = 'none';
        attachmentsQTDE++;
        attachmentsQTDEicon.innerHTML = attachmentsQTDE;

        fileListContainer.appendChild(li);
    }

    function search() {
        
        const searchInput = document.getElementById('searchForms');

        searchInput.addEventListener('input', () => {
            const filter = searchInput.value.toLowerCase();
            const cards = document.querySelectorAll('.cardSituation'); // Seleciona todos os cards

            cards.forEach(card => {
                const text = card.textContent.toLowerCase(); // Pega o texto do card
                if (text.includes(filter)) {
                    card.style.display = ''; // Mostra o card
                } else {
                    card.style.display = 'none'; // Oculta o card
                }
            });
        });
    }
}
