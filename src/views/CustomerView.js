import { riskLabel } from '../domain/riskProfile.js';
import { categoryLabel, formatCurrency } from './format.js';

export class CustomerView {
    #select = document.querySelector('#customer-select');
    #profile = document.querySelector('#customer-profile');

    renderOptions(customers) {
        this.#select.innerHTML = customers
            .map(c => `<option value="${c.id}">${c.name}${c.productIds.length === 0 ? ' · novo cliente' : ''}</option>`)
            .join('');
    }

    onSelect(handler) {
        this.#select.addEventListener('change', () => handler(Number(this.#select.value)));
    }

    selectedId() {
        return Number(this.#select.value);
    }

    renderProfile(customer, ownedProducts) {
        this.#profile.innerHTML = `
            <dl class="profile-grid">
                <div><dt>Idade</dt><dd>${customer.age} anos</dd></div>
                <div><dt>Renda mensal</dt><dd>${formatCurrency(customer.monthlyIncome)}</dd></div>
                <div><dt>Perfil (suitability)</dt><dd><span class="risk risk-${customer.riskProfile}">${riskLabel[customer.riskProfile]}</span></dd></div>
            </dl>
            <h3>Carteira atual</h3>
            <ul class="chips">${ownedProducts.length === 0
                ? '<li class="chip muted">Nenhum produto (cold start)</li>'
                : ownedProducts.map(p => `<li class="chip">${categoryLabel[p.category]} · ${p.name}</li>`).join('')}
            </ul>`;
    }
}
