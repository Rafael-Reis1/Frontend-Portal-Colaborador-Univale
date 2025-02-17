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
}

function authentication() {
    const token = localStorage.getItem('token');
    const nomeUser = document.getElementById('nomeUser');
    const setorCurso = document.getElementById('setorCurso');
    const selectCursoSetor = document.getElementById('selectCursoSetor');
    const adicionarlocalStorage = localStorage.getItem('adicionar');
    const deleteTh = document.getElementById('deleteTh');
    const correcaoStorage = localStorage.getItem('correcao');
    const nome = document.getElementById('nome');
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
        const tipoFuncionario = response.data.tipoFuncionario;
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
                cursoSetorForm.disabled = true;
                returnToProcessCards.style.display = 'block'
                fileUploadArea.style.display = 'none';
                
                disabled = 'disabled';
                style = 'style="display: none;'
            }
            else {
                btnADD.style.display = 'block';
                cancelForm.style.display = 'block';
                sendForm.style.display = 'block';
                somenteSalvar.style.display = 'block'
                deleteTh.style.display = 'table-cell';
                cursoSetorForm.value = cursoSetor;
                nome.value = nomeUser.innerHTML;
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
