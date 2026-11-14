import { EventBus } from './events/appEvents.js';
import { CustomerService } from './services/CustomerService.js';
import { ProductService } from './services/ProductService.js';
import { RecommenderClient } from './services/RecommenderClient.js';
import { CustomerView } from './views/CustomerView.js';
import { TrainingView } from './views/TrainingView.js';
import { RecommendationView } from './views/RecommendationView.js';
import { CustomerController } from './controllers/CustomerController.js';
import { TrainingController } from './controllers/TrainingController.js';
import { RecommendationController } from './controllers/RecommendationController.js';

const events = new EventBus();
const customerService = new CustomerService();
const productService = new ProductService();
await Promise.all([customerService.load(), productService.load()]);

const recommender = new RecommenderClient(
    new Worker(new URL('./workers/recommendationWorker.js', import.meta.url), { type: 'module' }));

const dependencies = { recommender, customerService, productService, events };

new RecommendationController({ view: new RecommendationView(), ...dependencies }).start();
new TrainingController({ view: new TrainingView(), ...dependencies }).start();
new CustomerController({ view: new CustomerView(), ...dependencies }).start();
