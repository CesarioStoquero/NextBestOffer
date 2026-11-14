import { formatPercent } from './format.js';

export class TrainingView {
    #bar = document.querySelector('#training-bar');
    #status = document.querySelector('#training-status');
    #button = document.querySelector('#retrain-button');

    onRetrain(handler) {
        this.#button.addEventListener('click', handler);
    }

    renderStarted() {
        this.#button.disabled = true;
        this.#bar.style.width = '0%';
        this.#status.textContent = 'Treinando o modelo no navegador…';
    }

    renderProgress({ epoch, totalEpochs, loss, accuracy }) {
        this.#bar.style.width = `${(epoch / totalEpochs) * 100}%`;
        this.#status.textContent = `Época ${epoch}/${totalEpochs} · loss ${loss.toFixed(3)} · acurácia ${formatPercent(accuracy)}`;
    }

    renderTrained({ samples }) {
        this.#button.disabled = false;
        this.#status.textContent = `Modelo treinado com ${samples} pares cliente × produto`;
    }

    renderStale() {
        this.#status.textContent = 'Nova contratação registrada: retreine para o modelo aprender com ela';
    }
}
