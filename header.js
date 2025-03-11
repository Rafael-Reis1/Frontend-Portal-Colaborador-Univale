function header() {
    const logoHeader = document.getElementById('logoHeader');
    const logoHeaderSmall =  document.getElementById('logoHeaderSmall');
    const sair = document.getElementById('sair');
    const selectTipoAtividade = document.getElementById('selectTipoAtividade');
    const selectCursoSetor = document.getElementById('selectCursoSetor');
    const nomeUser = document.getElementById('nomeUser');
    const containerUser = document.getElementById('containerUser');
    const setorCurso = document.getElementById('setorCurso');
    const selectBackgroud = document.getElementById('selectBackgroud');
    const tipoAtividadelocalStorage = sessionStorage.getItem('tipoAtividade');
    const optionsUser = document.getElementById('optionsUser');
    const confirmarSetor = document.getElementById('confirmarSetor');
    const cancelFormPopup = document.getElementById('cancelFormPopup');
    const sendFormPopup = document.getElementById('sendFormPopup');
    const formAttachmentPopup = document.getElementById('formAttachmentPopup');
    const darkMode = document.getElementById("darkMode");

    logoHeader.onclick = function() {
        document.location.href = formsPage;
    }

    logoHeaderSmall.onclick = function() {
        document.location.href = formsPage;
    }

    tipoAtividadeApi = tipoAtividadelocalStorage;

    containerUser.onmouseover = function() {
        containerUser.style.transition = `width 500ms cubic-bezier(.12,.12,0,1), height 500ms cubic-bezier(.12,.12,0,1)`;
        containerUser.style.height = `${optionsUser.clientHeight}px`;
        containerUser.style.maxHeight = 'fit-content';
    }

    containerUser.onmouseout = function() {
        defineTamanhoDivNomeUser(containerUser, nomeUser)
    }

    sair.onclick = function() {
        localStorage.removeItem('token');
        location.reload(true);
    }

    setorCurso.onclick = function() {
        window.scrollTo(0, 0);
        if(sessionStorage.getItem('selectCursoSetor')) {
            selectCursoSetor.value = sessionStorage.getItem('selectCursoSetor');  
        }
        selectTipoAtividade.style.display = 'flex';
        document.documentElement.style.overflow = 'hidden';
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if(selectTipoAtividade.style.display === 'flex') {
                selecionaSetorCurso(setorCurso, selectTipoAtividade, selectCursoSetor);
            }
            if(cancelFormPopup) {
                cancelFormPopup.style.opacity = 0;

                setTimeout(() => {
                    cancelFormPopup.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 200);
            }
            if(sendFormPopup) {
                sendFormPopup.style.opacity = 0;

                setTimeout(() => {
                    sendFormPopup.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 200);
            }
            if(formAttachmentPopup) {
                formAttachmentPopup.style.opacity = 0;

                setTimeout(() => {
                    formAttachmentPopup.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 200);
            }
        }
    });

    selectBackgroud.onclick = function() {
        selecionaSetorCurso(setorCurso, selectTipoAtividade, selectCursoSetor);
    }

    confirmarSetor.onclick = function() {
        selecionaSetorCurso(setorCurso, selectTipoAtividade, selectCursoSetor);
    }

    selectCursoSetor.onchange = function() {
        selecionaSetorCurso(setorCurso, selectTipoAtividade, selectCursoSetor);
    }

    if(localStorage.getItem('darkMode') === 'true') {
        document.body.classList.toggle("dark-mode");
        darkMode.innerHTML = "Dark Mode: On";
    }

    darkMode.onclick = function() {
        const mainContainer = document.querySelector('.mainContainer');
        const inputSearch = document.querySelector('.inputSearch');
        const cardSituation = document.querySelector('.cardSituation');
        const cardsSituation = document.querySelector('.cardsSituation');
        const containerUser = document.getElementById('containerUser');
        const logoHeader = document.getElementById('logoHeader');
        const whiteButton = document.querySelector('.whiteButton');
        const formPaper = document.getElementById('formPaper');
        const FormInputs = document.getElementById('FormInputs');
        const formBackground = document.getElementById('formBackground');
    
        document.body.classList.toggle("dark-mode");
    
        // Lista de elementos
        const elements = [mainContainer, inputSearch, cardSituation, cardsSituation,
                containerUser, logoHeader, whiteButton, formPaper, FormInputs, formBackground];
    
        // Aplica a transição apenas nos elementos que existem
        elements.forEach(el => el && (el.style.transition = 'ease 275ms'));
    
        if(localStorage.getItem('darkMode') === 'false') {
            localStorage.setItem('darkMode', 'true');
            darkMode.innerHTML = "Dark Mode: On";
        }
        else if(localStorage.getItem('darkMode') === 'true') {
            localStorage.setItem('darkMode', 'false');
            darkMode.innerHTML = "Dark Mode: Off";
        }
        else {
            localStorage.setItem('darkMode', 'true');
        }
    
        setTimeout(() => {
            elements.forEach(el => el && (el.style.transition = ''));
        }, 1000);
    };
    
}

function defineTamanhoDivNomeUser(containerUser, nomeUser) {
    containerUser.style.transition = `width 500ms cubic-bezier(.12,.12,0,1), height 500ms cubic-bezier(.12,.12,0,1)`;
    containerUser.style.width = `${nomeUser.clientWidth + 1}px`;
    containerUser.style.height = '2.125rem';
}

function selecionaSetorCurso(setorCurso, selectTipoAtividade, selectCursoSetor) {
    setorCurso.innerText = 'Setor/Curso: ' + selectCursoSetor.value;
    sessionStorage.setItem('selectOption', selectCursoSetor.value);
    const selectedOption = selectCursoSetor.options[selectCursoSetor.selectedIndex];
    tipoAtividadeApi = selectedOption.getAttribute('data-tipo');
    cpfGestorApi = selectedOption.getAttribute('data-cpfgestor');
    nomeGestorApi = selectedOption.getAttribute('data-nomegestor');
    tipoFuncApi = selectedOption.getAttribute('data-tipoFunc');
    
    sessionStorage.setItem('tipoAtividade', tipoAtividadeApi);
    sessionStorage.setItem('cpfGestor', cpfGestorApi);
    sessionStorage.setItem('nomeGestor', nomeGestorApi);
    sessionStorage.setItem('selectCursoSetor', selectCursoSetor.value);
    sessionStorage.setItem('tipoFunc', tipoFuncApi);
    selectTipoAtividade.style.display = 'none';
    document.body.style.overflow = 'auto';
    location.reload(true);
}