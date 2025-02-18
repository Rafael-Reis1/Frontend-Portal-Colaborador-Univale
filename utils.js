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

const fileInput = document.getElementById('file-input');
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
