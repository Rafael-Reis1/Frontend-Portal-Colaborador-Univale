//const baseURL = `http://127.0.0.1:3000`;
const baseURL = `http://192.168.218.26:3000`;
const formsPage = '/';
const loginPage = 'login.html';
const ocorrenciasPontoPage = 'Forms/ocorrenciasPonto/ocorrenciasPonto.html';
const pequenasDespesasPage = 'Forms/Prestação de Contas de Pequenas Despesas/prestacaoDeContasDePequenasDespesas.html'
var tipoAtividadeApi = sessionStorage.getItem('tipoAtividade');
var cpfGestorApi = sessionStorage.getItem('cpfGestor');
var nomeGestorApi = sessionStorage.getItem('nomeGestor');
var Estagiario = false;

window.onload = function() {
    //Login
    if (document.title == 'Login') {
        const loginEntrar = document.getElementById('loginEntrar');
        const cpfLogin = document.getElementById('cpfLogin');
        const senhaLogin = document.getElementById('senhaLogin');
        localStorage.clear();
        sessionStorage.clear();
    
        cpfLogin.onkeydown = function(e) {
            if (e.key === 'Enter' || e.code === 13) {
                login(cpfLogin, senhaLogin);
            }
        }

        senhaLogin.onkeydown = function(e) {
            if (e.key === 'Enter' || e.code === 13) {
                login(cpfLogin, senhaLogin);
            }
        }
    
        loginEntrar.onclick = function() {
            login(cpfLogin, senhaLogin);
        }
                
    }
    //Home com os cards de formularios
    if (document.title == 'Forms home') {
        const ocorrenciasPonto = document.getElementById('ocorrenciasPonto');
        const pequenasDespesas = document.getElementById('pequenasDespesas');

        authentication();

        header();

        search();

        ocorrenciasPonto.onclick = function() {
            document.location.href = ocorrenciasPontoPage;
        }

        pequenasDespesas.onclick = function() {
            document.location.href = pequenasDespesasPage;
        }
    }
}

//Controla a autenticação na tela de login
function login(cpf, senha){
    const loading = document.getElementById('loading');

    if (cpf.value) {
        if (senha.value) {
            loading.style.display = 'flex';
            axios.post(baseURL + `/login`, {
                cpf: cpf.value,
                password: senha.value
            })
            .then(response => {
                loading.style.display = 'none';
                localStorage.setItem('token', response.data.access_token);
                document.location.replace(formsPage);
            })
            .catch(error =>{
                loading.style.display = 'none';
                if (error.response) {
                    if (error.response.status === 401) {
                        alert('CPF ou senha inválidos. Verifique e tente novamente.');
                    }
                    else {
                        alert('Sentimos muito! Algo não saiu como esperado. Nossa equipe de suporte está pronta para ajudar — entre em contato para resolvermos isso juntos.');
                    }
                }
            });
        }
        else {
            alert("Campo senha é obrigatório");
            senha.focus();
        }
    }
    else {
        alert("Campo CPF é obrigatório");
        cpf.focus();
    }
}

//Faz a pagina ser uma pagina que so pode ter acesso por autenticação
function authentication() {
    const token = localStorage.getItem('token');
    const nomeUser = document.getElementById('nomeUser');
    const setorCurso = document.getElementById('setorCurso');
    const selectCursoSetor = document.getElementById('selectCursoSetor');
    const selectCursoSetorSessionStorage =  sessionStorage.getItem('selectCursoSetor');
    const containerUser = document.getElementById('containerUser');
    const tipoAtividadelocalStorage = sessionStorage.getItem('tipoAtividade');
    const selectTipoAtividade = document.getElementById('selectTipoAtividade');

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
        let i = 0;

        if(cursoSetor.length == 0) {
            alert('Você deve estar ativo em pelo menos 1 setor!');
    
            document.location.replace(loginPage);
        }
        
        cursoSetor.forEach(cursoSetor => {
            selectCursoSetor.innerHTML += `<option value="${cursoSetor}" data-tipo="${tipoAtividade[i]}" data-cpfGestor="${cpfGestor[i]}" data-nomeGestor="${nomeGestor[i]}">${cursoSetor}</option>`;
            i++;
        });
        
        if(cursoSetor.length == 1) {
            setorCurso.innerText = 'Setor/Curso: ' + selectCursoSetor.value;
            sessionStorage.setItem('tipoAtividade', tipoAtividade[0]);
            sessionStorage.setItem('cpfGestor', cpfGestor[0]);
            sessionStorage.setItem('nomeGestor', nomeGestor[0]);

            response.data.tipoFuncionario.forEach(tipoFuncionario => {
                if(tipoFuncionario == 'ESTAGIARIO') {
                    Estagiario = true;
                }
            });
            
            filtraCards(tipoAtividade[0], Estagiario, response.data.nome);
        }
        if(cursoSetor.length > 1 && selectCursoSetorSessionStorage === null) {
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
            filtraCards(tipoAtividadelocalStorage, Estagiario, response.data.nome);
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

function filtraCards(tipoAtividade, Estagiario, nome) {
    const ocorrenciasPonto = document.getElementById('ocorrenciasPonto');
    const pequenasDespesas = document.getElementById('pequenasDespesas');

    if(!Estagiario) {
        if(tipoAtividade == 'PTA') {
            ocorrenciasPonto.style.display = 'flex';
            pequenasDespesas.style.display = 'flex'
        }
    
        else if(tipoAtividade == 'PROFESSOR') {
            ocorrenciasPonto.style.display = 'flex';
        }
    }

    if(nome === "RAFAEL REIS DA SILVEIRA") {
        ocorrenciasPonto.style.display = 'flex';
        pequenasDespesas.style.display = 'flex'
    }
}

function search() {
    const searchInput = document.getElementById('searchForms');
    const cards = document.querySelectorAll('.formCard');

    // Adiciona o evento de input ao campo de pesquisa
    searchInput.addEventListener('input', () => {
      const filter = searchInput.value.toLowerCase(); // Transforma o texto digitado em minúsculas

      // Itera sobre todos os cards
      cards.forEach(card => {
        const text = card.textContent.toLowerCase(); // Pega o texto do card em minúsculas
        if (text.includes(filter)) {
          card.style.display = ''; // Mostra o card
        } else {
          card.style.display = 'none'; // Oculta o card
        }
      });
    });
}
