import { riskLabel } from '../domain/riskProfile.js';
import { categoryLabel, formatCurrency, formatProbability } from './format.js';

export class RecommendationView {
    #list = document.querySelector('#recommendations');
    #source = document.querySelector('#recommendation-source');
    #blocked = document.querySelector('#blocked-products');

    onContract(handler) {
        this.#list.addEventListener('click', event => {
            const button = event.target.closest('[data-product-id]');
            if (button) {
                handler(button.dataset.productId);
            }
        });
    }

    renderWaiting() {
        this.#source.textContent = 'Aguardando o fim do treino…';
        this.#list.innerHTML = '';
    }

    renderRecommendations(items, source) {
        this.#source.textContent = source;
        this.#list.innerHTML = items.length === 0
            ? '<li class="empty">Nenhum produto elegível para este cliente</li>'
            : items.map((item, index) => this.#card(item, index)).join('');
    }

    renderBlocked(blocked) {
        this.#blocked.innerHTML = blocked.length === 0
            ? '<li class="muted">Nenhum produto bloqueado</li>'
            : blocked.map(b => `<li><strong>${b.product.name}</strong><span>${b.violations.map(v => v.reason).join(' · ')}</span></li>`).join('');
    }

    #card({ product, score }, index) {
        return `
            <li class="offer">
                <span class="rank">#${index + 1}</span>
                <div class="offer-body">
                    <span class="tag">${categoryLabel[product.category]}</span>
                    <h3>${product.name}</h3>
                    <p>Risco ${riskLabel[product.risk]} · ${product.monthlyFee === 0 ? 'Sem tarifa' : `${formatCurrency(product.monthlyFee)}/mês`}</p>
                </div>
                <div class="offer-score">
                    <strong>${formatProbability(score)}</strong>
                    <small>chance de contratar</small>
                    <button type="button" data-product-id="${product.id}">Contratar</button>
                </div>
            </li>`;
    }
}
