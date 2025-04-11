const selectedFiles = new Map();
let hasAttachments;

//Inicia um novo processo no Fluig
function processStart(formIds, formData, textAreaData, somenteSalvar, token, 
    targetState, processId, cpfGestorApi, nomeGestorApi, tipoAtividadeApi, 
    completeTask, processSector, nextPage, initialActivity) {
    const loadingFullScreen = document.getElementById('loadingFullScreen');

    adicionarTextoLoading('Salvando formulário!', 0);

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
            openToast(response.data[1], 'erro', 5000000);
            //alert(response.data[1]);
        }
        else {
            if(somenteSalvar) {
                if(hasAttachments) {
                    enviarAttachment(response.data, formIds, formData, textAreaData, processId, processSector, 
                        targetState, cpfGestorApi, nextPage, false, somenteSalvar);
                }
                else {
                    document.location.replace(nextPage);
                }
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
        openToast(JSON.stringify(error.response.data, null, 2), 'erro', 5000000);
        //alert(JSON.stringify(error.response.data, null, 2));
        document.body.style.overflow = 'auto';
        loadingFullScreen.style.display = 'none'
    });
}

//Atualiza um formulário existente no fluig
function processUpdate(cardId, formIds, formData, textAreaData, somenteSalvar, token, 
    cpfGestorApi, formFolderId, processId, processSector, targetState, nextPage, cancel) {
    const loadingFullScreen = document.getElementById('loadingFullScreen');

    adicionarTextoLoading('Salvando formulário!', 0);

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
            if(hasAttachments) {
                enviarAttachment(cardId, formIds, formData, textAreaData, processId, processSector, 
                    targetState, cpfGestorApi, nextPage, false, somenteSalvar);
            }
            else {
                document.location.replace(nextPage);
            }
        }
        else {
            if(hasAttachments) {
                enviarAttachment(cardId, formIds, formData, textAreaData, processId,
                    processSector, targetState, cpfGestorApi, nextPage, cancel);
            }
            else {
                moveRequest(cardId, formIds, formData, textAreaData, 
                    targetState, cpfGestorApi, nextPage, cancel);
            }
        }
    })
    .catch(error =>{
        loadingFullScreen.style.display = 'none';
        document.body.style.overflow = 'auto';
        openToast(error.response.data.message.replace(/[{}]/g, ''), 'erro', 5000000);
        //alert(error.response.data.message.replace(/[{}]/g, ''));
    });
}

//Envia os arquivos de anexo para o Fluig
function enviarAttachment(processInstanceId, formIds, formDataJson, 
    textAreaData, processId, processSector, targetState, cpfGestorApi, nextPage, cancel, somenteSalvar) {
    const formData = new FormData();
    const token = localStorage.getItem('token');

    adicionarTextoLoading('Estamos enviando seus anexos. <br>Este processo pode levar alguns minutos. Por favor, aguarde!', 500);

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
        onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
                console.log(`${(progressEvent.loaded / progressEvent.total) * 100}%`);
            }
        }
    })
    .then(response => {
        if(somenteSalvar) {
            document.location.replace(nextPage);
        }
        else {
            formIds.push('attachmentId');
            formDataJson.push(response.data);
            moveRequest(processInstanceId, formIds, formDataJson, textAreaData, 
                targetState, cpfGestorApi, nextPage, cancel);
        }
    })
    .catch(error => {
        openToast('Erro ao enviar arquivos', 'erro', 5000000);
        console.error('Erro ao enviar arquivos', error);
    });
}

//Move um formulário existente para a proxima atividade
function moveRequest(processInstanceId, formIds, formData, textAreaData, 
    targetState, cpfGestorApi, nextPage, cancel) {
    const token = localStorage.getItem('token');
    const cardId = localStorage.getItem('cardId');
    const loadingFullScreen = document.getElementById('loadingFullScreen');

    if(cancel) {
        adicionarTextoLoading('Cancelando solicitação!', 500);
    }
    else {
        adicionarTextoLoading('Enviando formulário para aprovação!', 500);
    }
    

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
        openToast(error.response.data.message.replace(/[{}]/g, ''), 'erro', 5000000);
        //alert(error.response.data.message.replace(/[{}]/g, ''));
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

function searchForm() {
        
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


function loadAnexos(targetState, deleteIcon) {
    const token = localStorage.getItem('token');
    const cardId = localStorage.getItem('cardId');
    const fileListContainer = document.getElementById('file-list');
    const attachements = document.getElementById('attachements');

    axios.get(baseURL + `/process/attachments/${cardId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    })
    .then(response => {
        if(response.data.length > 0) {
            response.data.forEach(item => {
                attachements.value +=`,${item.documentId}`;
                criaListaAttachment(fileListContainer, '', 'api', item.documentDescription, item.fileUrl, item, cardId, targetState, deleteIcon);
            });
        } 
    })
    .catch(error => {
        openToast(error.message, 'erro', 5000000);
        //alert(error.message);
    });
}

//Logica para buscar os anexos nos arquivos do pc
function adicionarAttachments(fileInput) {
    const fileListContainer = document.getElementById('file-list');
    const fileUploadArea = document.getElementById('file-upload');

    // Função para adicionar arquivos à lista
    function addFileToList(file) {
        if (selectedFiles.has(file.name)) {
            openToast('Este arquivo já foi selecionado!', 'erro', 5000000);
            //alert('Este arquivo já foi selecionado!');
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

    // Quando o arquivo é solto
    fileUploadArea.addEventListener('drop', function (event) {
        event.preventDefault(); // Impede o comportamento padrão
        Array.from(event.dataTransfer.files).forEach(file => addFileToList(file)); // Processa todos os arquivos arrastados
    });
    
    updateUploadAreaColor();
}

function updateUploadAreaColor() {
    const fileUploadArea = document.getElementById('file-upload');
    const root = document.documentElement;

    if(document.body.classList.contains("dark-mode")) {
        if(fileUploadArea) {
            fileUploadArea.style.backgroundColor = '#000629';
        
            // Evento de arraste para dentro da área de upload
            fileUploadArea.addEventListener('dragover', function (event) {
                event.preventDefault(); // Impede o comportamento padrão
                fileUploadArea.style.backgroundColor = '#001175'; // Indica que o arquivo pode ser solto
            });
    
            fileUploadArea.addEventListener('dragleave', function () {
                fileUploadArea.style.backgroundColor = '#000629'; // Volta ao estilo original
            });
    
            // Quando o arquivo é solto
            fileUploadArea.addEventListener('drop', function (event) {
                event.preventDefault(); // Impede o comportamento padrão
                fileUploadArea.style.backgroundColor = '#000629'; // Volta ao estilo original
            });
        }
    }
    else {
        if(fileUploadArea) {
            fileUploadArea.style.backgroundColor = getComputedStyle(root).getPropertyValue('--background-color');

            // Evento de arraste para dentro da área de upload
            fileUploadArea.addEventListener('dragover', function (event) {
                event.preventDefault(); // Impede o comportamento padrão
                fileUploadArea.style.backgroundColor = getComputedStyle(root).getPropertyValue('--drag-over-background-color'); // Indica que o arquivo pode ser solto
            });
    
            fileUploadArea.addEventListener('dragleave', function () {
                fileUploadArea.style.backgroundColor = getComputedStyle(root).getPropertyValue('--background-color'); // Volta ao estilo original
            });
    
            // Quando o arquivo é solto
            fileUploadArea.addEventListener('drop', function (event) {
                event.preventDefault(); // Impede o comportamento padrão
                fileUploadArea.style.backgroundColor = getComputedStyle(root).getPropertyValue('--background-color'); // Volta ao estilo original
            });
        }
    }
}

//Logica para definir se é um arquivo que foi buscado da api ou do armazenamento + criar a lista
function criaListaAttachment(fileListContainer, file, source, documentDescription, fileUrl, item, processInstanceId, targetState, deleteIcon) {
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
    let actionIconDelete;
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

        if(deleteIcon) {
            actionIconDelete = document.createElement('span');
            actionIconDelete.classList.add('remove-icon');
            actionIconDelete.textContent = '❌';
            actionIconDelete.addEventListener('click', function () {
                if (confirm("Tem certeza que deseja excluir este anexo?")) {
                    deleteAttachment(processInstanceId, targetState, item.documentId, item.version)
                    selectedFiles.delete(file.name); // Remove o arquivo do Map
                    attachmentsQTDE--;
                    if(attachmentsQTDE == 0) {
                        hasAttachments = false;
                        semAnexo.style.display = 'inline';
                    }
                    attachmentsQTDEicon.innerHTML = attachmentsQTDE;
                    li.remove(); // Remove o elemento da lista
                }
            });
        }
    }

    li.appendChild(icon);
    li.appendChild(fileName);
    li.appendChild(actionIcon);
    if(actionIconDelete) {
        li.appendChild(actionIconDelete);
    }

    semAnexo.style.display = 'none';
    attachmentsQTDE++;
    attachmentsQTDEicon.innerHTML = attachmentsQTDE;

    fileListContainer.appendChild(li);
}

function deleteAttachment(processInstanceId, targetState, documentId, documentVersion) {
    const token = localStorage.getItem('token');
    const loadingFullScreen = document.getElementById('loadingFullScreen');

    loadingFullScreen.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    axios.put(baseURL + `/process/deleteAttachment`, {
        processInstanceId: processInstanceId,
        targetState: targetState,
        documentId: documentId,
        documentVersion: documentVersion
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => {
        loadingFullScreen.style.display = 'none';
        document.body.style.overflow = 'auto';
        return true;
    })
    .catch(error =>{
        loadingFullScreen.style.display = 'none';
        document.body.style.overflow = 'auto';
        openToast(error.message, 'erro', 5000000);
        //alert(error.message);
    });
}

function adicionarTextoLoading(text, tempo) {
    const textLoading = document.getElementById('textLoading');

    if(textLoading)  {
        textLoading.style.opacity = 0;

        setTimeout(() => {
            textLoading.innerHTML = text;
            textLoading.style.opacity = 1;
        }, tempo);
    }
}

let toastQueue = [];
let isToastVisible = false;

function openToast(message, type, time, callback) {
  toastQueue.push({ message, type, time, callback });

  if (!isToastVisible) {
    showNextToast();
  }
}

function showNextToast() {
  if (toastQueue.length === 0) {
    isToastVisible = false;
    return;
  }

  isToastVisible = true;
  const currentToast = toastQueue.shift();
  const { message, type, time, callback } = currentToast;

  const toast = document.getElementById('toast');
  const toastImg = document.getElementById('toastImg');
  const toastIcon = document.getElementById('toastIcon');
  const toastMessage = document.getElementById('toastMessage');

  toast.style.display = 'flex';
  toast.style.opacity = 0;

  if (type === 'warning') {
    toastImg.src = "../../assets/warningIcon.png";
    toastIcon.style.backgroundColor = '#e3b420';
  } else if (type === 'erro') {
    toastImg.src = "../../assets/errorIcon.png";
    toastIcon.style.backgroundColor = '#cc3d3d';
  }

  setTimeout(() => {
    toastMessage.innerHTML = message;
    toast.style.opacity = 1;
    hideToast(time, callback);
  }, 50);

  function hideToast(time, callback) {
    setTimeout(() => {
      toast.style.opacity = 0;
      setTimeout(() => {
        toast.style.display = 'none';
        if (callback) {
          callback(true);
        }
        showNextToast();
      }, 500);
    }, time);
  }

  // Evento de clique para fechar o toast
    document.getElementById('closeToast').addEventListener('click', () => {
        const toast = document.getElementById('toast');
        toast.style.opacity = 0;
        setTimeout(() => {
            toast.style.display = 'none';
            showNextToast();
        }, 500);
    });
}

function initNotfication(index) {
    const notification = document.getElementById('notification');
    const notificationListContainer = document.querySelector('.notificationListContainer');
    const token = localStorage.getItem('token');
    const notificationIcon =  document.getElementById('notificationIcon');
    const notificationIconElement = document.querySelector('.notification-icon');
    let backgroundImage;
    let backgroundImageFill;

    if(index) {
        backgroundImage = "url('assets/notifications_16dp.png')";
        backgroundImageFill = "url('assets/notifications_16dp_FILL.png')";
    }
    else {
        backgroundImage = "url('../../assets/notifications_16dp.png')";
        backgroundImageFill = "url('../../assets/notifications_16dp_FILL.png')";
    }


    notificationIconElement.style.backgroundImage = backgroundImage;
    
    document.onclick = function(event) {
        const isClickInsideList = notificationListContainer.contains(event.target);
        const isClickInsideNotification = notification.contains(event.target);
    
        if (!isClickInsideList && !isClickInsideNotification && notificationListContainer.classList.contains('notificationOpen')) {
            notificationListContainer.classList.remove('notificationOpen');
            notificationIconElement.style.backgroundImage = backgroundImage;
        }
        if(!isClickInsideList && isClickInsideNotification) {
            notificationListContainer.classList.toggle('notificationOpen');

            if(document.querySelector('.notificationOpen')) {
                notificationIconElement.style.backgroundImage = backgroundImageFill;
            }
            else {
                notificationIconElement.style.backgroundImage = backgroundImage;
            }
        }
    }

    const socket = io('https://portalcolaborador.univale.br', {
        path: '/api/socket.io',
        auth: {
            authorization: `Bearer ${token}`
        },
    });
    socket.emit('conectUser', {});

    socket.emit('findAllNotifications', {}, (response) => {
        response.forEach(notification => {
            notificationListContainer.scrollTo({
                top: -notificationListContainer.scrollHeight
            });
            if(!notification.read) {
                notificationIcon.classList.add('has-notification');
                notificationIconElement.title = "Você tem novas notificações!";
            }
            else {
                notificationIconElement.title = "Nenhuma notificação pendente!";
            }
            populateCardNotification(notification.nameSender, notification.cpfReceiver,
                notification.id, notification.instanceId, notification.processId,
                notification.read, notification.url, socket, notificationIcon, notificationIconElement,
                notification.acitivityName, notification.createdAt
            );
        });
    });

    socket.on('new-notification', (notification) => {
        populateCardNotification(notification.notification.nameSender, notification.notification.cpfReceiver,
            notification.notification.id, notification.notification.instanceId, notification.notification.processId,
            notification.notification.read, notification.notification.url, socket, notificationIcon, notificationIconElement,
            notification.notification.acitivityName, notification.createdAt
        );
        notificationListContainer.scrollTo({
            top: -notificationListContainer.scrollHeight,
            behavior: 'smooth' // Rolar suavemente (opcional)
        });
        notificationIcon.classList.add('has-notification');
        notificationIconElement.title = "Você tem novas notificações!";
    });
}

function populateCardNotification(nameSender, cpfReceiver, id, instanceId, processId,
    read, url, socket, notificationIcon, notificationIconElement, acitivityName, createdAt) {
    const bodyCard = document.querySelector('.notificationList');
    const fragment = document.createDocumentFragment();
    const noNotification = document.getElementById('noNotification');
    noNotification.style.display = 'none';
    const lerTodasNotifi = document.getElementById('lerTodasNotifi');

    const card = document.createElement('div');
    card.classList.add('notificationContainer');
    card.dataset.id = instanceId;
    card.dataset.notificationId = id;

    const createdAtDate = new Date(createdAt);

    card.innerHTML = `
        <p><strong>${nameSender}</strong> encaminhou a <strong>solicitação ${instanceId}</strong> para ${acitivityName} em <strong>${processId}</strong></p>
        <span class="notificationTime" data-timestamp="${createdAtDate.getTime()}"></span>
    `;

    const timeElement = card.querySelector('.notificationTime');
    const timestamp = createdAtDate.getTime();

    function updateTimeAgo() {
        const now = new Date();
        const seconds = Math.floor((now - timestamp) / 1000);
    
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) {
            timeElement.textContent = interval + ' ano' + (interval > 1 ? 's' : '') + ' atrás';
            return;
        }
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            timeElement.textContent = interval + ' mês' + (interval > 1 ? 'es' : '') + ' atrás';
            return;
        }
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            timeElement.textContent = interval + ' dia' + (interval > 1 ? 's' : '') + ' atrás';
            return;
        }
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            timeElement.textContent = interval + ' hora' + (interval > 1 ? 's' : '') + ' atrás';
            return;
        }
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            timeElement.textContent = interval + ' minuto' + (interval > 1 ? 's' : '') + ' atrás';
            return;
        }
        if (seconds >= 1) {
            timeElement.textContent = seconds + ' segundo' + (seconds > 1 ? 's' : '') + ' atrás';
            return;
        }
        timeElement.textContent = 'agora';
    }

    updateTimeAgo();

    const intervalId = setInterval(updateTimeAgo, 60000);

    card.addEventListener('removed', () => {
        clearInterval(intervalId);
    });

    lerTodasNotifi.onclick = function() {
        const hasNotification = document.querySelectorAll('.has-notification');
        let isFirst = true;

        hasNotification.forEach(element => {
            if (isFirst) {
                isFirst = false;
                return; // Pula a primeira iteração
            }
            const notificationId = element.dataset.notificationId;
            readNotification(notificationId, socket, cpfReceiver, notificationIcon, notificationIconElement, element);
        });
    }

    card.addEventListener('click', () => {
        readNotification(id, socket, cpfReceiver, notificationIcon, notificationIconElement, card);

        /*localStorage.setItem('cardId', instanceId);
        if(acitivityName.toLowerCase() == 'correção') {
            localStorage.setItem('correcao', 'true');
            localStorage.setItem('adicionar', 'false');
        }
        else if (acitivityName.toLowerCase() == 'aprovação') {
            localStorage.setItem('correcao', 'false');
            localStorage.setItem('adicionar', 'false');
        }*/
        document.location.href = url;
    });

    if (read) {
        card.classList.remove('has-notification');

    } else {
        card.classList.add('has-notification');
    }

    fragment.appendChild(card);

    if (bodyCard) {
        bodyCard.appendChild(fragment);
    } else {
        console.error("Elemento com a classe 'notificationList' não encontrado.");
    }
}

function readNotification(id, socket, cpfReceiver, notificationIcon, notificationIconElement, card) {
    console.log(id);
    socket.emit('readNotification', {
            read: true,
            cpfReceiver: cpfReceiver,
            id: id
        }, (response) => {
            card.classList.remove('has-notification');
            const hasNotification = document.querySelectorAll('.has-notification');
            if(hasNotification.length <= 1) {
                notificationIcon.classList.remove('has-notification');
                notificationIconElement.title = "Nenhuma notificação pendente!";
            }
        }
    );
}
