const selectedFiles = new Map();
let hasAttachments;

//Inicia um novo processo no Fluig
function processStart(formIds, formData, textAreaData, somenteSalvar, token, 
    targetState, processId, cpfGestorApi, nomeGestorApi, tipoAtividadeApi, 
    completeTask, processSector, nextPage, initialActivity) {
    const loadingFullScreen = document.getElementById('loadingFullScreen');

    loadingFullScreen.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    
    axios.post(baseURL + `/process/start`, {
        targetState: targetState,
        processId: processId,
        colleagueIds: [cpfGestorApi],
        nomeGestor: nomeGestorApi,
        cpfGestor: cpfGestorApi,
        tipoAtividade: tipoAtividadeApi,
        formIds: formIds,
        formData: formData,
        textAreaData,
        completeTask: completeTask,
        activity: initialActivity
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
                document.location.replace(nextPage);
            }
            else {
                document.body.style.overflow = 'auto';
                localStorage.setItem('correcao', 'true');
                localStorage.setItem('adicionar', 'false');

                if(hasAttachments) {
                    enviarAttachment(response.data, formIds, formData, textAreaData, processId, processSector, 
                        targetState, cpfGestorApi, nextPage);
                }
                else {
                    moveRequest(response.data, formIds, formData, textAreaData, 
                        targetState, cpfGestorApi, nextPage);
                }
            }
        }
    })
    .catch(error =>{
        alert(JSON.stringify(error.response.data, null, 2));
        document.body.style.overflow = 'auto';
        loadingFullScreen.style.display = 'none'
    });
}

//Atualiza um formulário existente no fluig
function processUpdate(cardId, formIds, formData, textAreaData, somenteSalvar, token, 
    cpfGestorApi, formFolderId, processId, processSector, targetState, nextPage) {
    const loadingFullScreen = document.getElementById('loadingFullScreen');

    loadingFullScreen.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';

    axios.put(baseURL + `/process/update`, {
        processInstanceId: cardId,
        colleagueIds: [cpfGestorApi],
        formIds: formIds,
        formData: formData,
        textAreaData,
        forlderId: formFolderId
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => {
        if(somenteSalvar) {
            loadingFullScreen.style.display = 'none';
            document.body.style.overflow = 'auto';
            document.location.replace(nextPage);
        }
        else {
            if(hasAttachments) {
                enviarAttachment(cardId, formIds, formData, textAreaData, processId,
                    processSector, targetState, cpfGestorApi, nextPage);
            }
            else {
                moveRequest(cardId, formIds, formData, textAreaData, 
                    targetState, cpfGestorApi, nextPage);
            }
        }
    })
    .catch(error =>{
        loadingFullScreen.style.display = 'none';
        document.body.style.overflow = 'auto';
        alert(error.response.data.message.replace(/[{}]/g, ''));
    });
}

//Envia os arquivos de anexo para o Fluig
function enviarAttachment(processInstanceId, formIds, formDataJson, 
    textAreaData, processId, processSector, targetState, cpfGestorApi, nextPage) {
    const formData = new FormData();
    const token = localStorage.getItem('token');

    // Adicionar todos os arquivos de `selectedFiles` ao FormData
    selectedFiles.forEach(file => {
        formData.append('files', file);
    });

    const jsonData = {
        key: processInstanceId,
        value: processId,
        key2: tipoAtividadeApi,
        value2: processSector
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
        moveRequest(processInstanceId, formIds, formDataJson, textAreaData, 
            targetState, cpfGestorApi, nextPage);
    })
    .catch(error => {
        console.error('Erro ao enviar arquivos', error);
    });
}

//Move um formulário existente para a proxima atividade
function moveRequest(processInstanceId, formIds, formData, textAreaData, 
    targetState, cpfGestorApi, nextPage) {
    const token = localStorage.getItem('token');
    const cardId = localStorage.getItem('cardId');
    const loadingFullScreen = document.getElementById('loadingFullScreen');

    loadingFullScreen.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';

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
        document.location.replace(nextPage);
    })
    .catch(error =>{
        //alert(JSON.stringify(error.response.data, null, 2));
        loadingFullScreen.style.display = 'none';
        document.body.style.overflow = 'auto';
        alert(error.response.data.message.replace(/[{}]/g, ''));
    });
}

function populateCards(dados, bodyCardsName, pageToGo) {
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
        document.location.href = pageToGo;
    });

    fragment.appendChild(card);
    
    bodyCard.appendChild(fragment);
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

//Logica para buscar os anexos nos arquivos do pc
function adicionarAttachments(fileInput) {
    const fileListContainer = document.getElementById('file-list');
    const fileUploadArea = document.getElementById('file-upload');

    // Função para adicionar arquivos à lista
    function addFileToList(file) {
        if (selectedFiles.has(file.name)) {
            alert('Este arquivo já foi selecionado!');
            return;
        }

        selectedFiles.set(file.name, file); // Armazena o arquivo completo no Map

        criaListaAttachment(fileListContainer, file, "upload", '', '');
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

//Logica para definir se é um arquivo que foi buscado da api ou do armazenamento + criar a lista
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
        hasAttachments = true;
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
                hasAttachments = false;
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
            window.open(fileUrl, '_blank');
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
