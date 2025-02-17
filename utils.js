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
