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
    }if (document.title == 'Form') {
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
    }
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
