
import { FormController } from "./formController.js";
import { FormStore } from "./formStore.js";
import { ProgressBar } from "./progressBar.js";

class StepForm {
    constructor({ data, formContainer, hsFormContainer, thankYouMessageContainer }) {
        this.data = data;
        this.stepForm = formContainer;
        this.hsForm = hsFormContainer;
        this.thankYouMessage = thankYouMessageContainer;

        this.formStore = new FormStore(data);
        this.formController = new FormController(this);
        this.progressBar = new ProgressBar(this.formStore, data,this.stepForm);
    }

    thankYou() {
        this.formController.thankYou();
    }

    resetForm() {
        this.formStore.resetForm();
    }
    
}

window.StepForm = StepForm;

// new StepForm({
//     data: FORM_DATA,
//     formContainer: document.querySelector('.step-form'),
//     hsFormContainer: document.querySelector('.huspot-form'),
//     thankYouMessageContainer: document.querySelector('.thank-you-message')
// });
