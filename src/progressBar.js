// ProgressBar class for step-form
export class ProgressBar {
  /**
   * @param {object} formStore - The form store with current values.
   * @param {object} schema - The form schema (FORM_DATA).
   * @param {HTMLElement} FormContainer - The container to render the progress bar into.
   */
  constructor(formStore, schema, FormContainer) {
    this.formStore = formStore;
    this.schema = schema;
    this.FormContainer = FormContainer;

    this.stepMap = Object.fromEntries(this.schema.map(step => [step.id, step]));

    this.initWrapper();

    // get current step id
    // this.render(this.formStore.getCurrentStep().id);
    this.formStore.subscribe((state) => {
        // console.log("state",state.currentStep);
        this.render(state.currentStep);
        if(state.currentStep === "thank_you"){
            this.progressBar.remove();
        }
    })
  }

  /**
   * Initializes the progress bar wrapper and its child elements if not already present.
   */
  initWrapper() {
    if (!this.FormContainer) return;

    // Check if progress bar wrapper exists
    let barWrapper = this.FormContainer.querySelector('.progress-bar-wrapper');
    if (!barWrapper) {
      barWrapper = document.createElement('div');
      barWrapper.className = 'progress-bar-wrapper';

      const barContainer = document.createElement('div');
      barContainer.className = 'progress-bar';

      const bar = document.createElement('div');
      bar.className = 'progress-bar-fill';

      barContainer.appendChild(bar);

      const label = document.createElement('div');
      label.className = 'progress-bar-label';

      barWrapper.appendChild(barContainer);
      barWrapper.appendChild(label);

      this.progressBar = barWrapper;

      this.FormContainer.appendChild(this.progressBar);
    }
  }

  /**
   * Helper to traverse the flow object based on selected field values.
   * @param {object|array} flowBranch
   * @param {object} values
   * @returns {array} path of step ids
   */
  traverseFlow(flowBranch, values) {
    if (Array.isArray(flowBranch)) {
      return flowBranch;
    }
    // Check if any value in values matches a key in flowBranch
    for (const val of Object.values(values)) {
      if (val !== undefined && flowBranch.hasOwnProperty(val)) {
        return this.traverseFlow(flowBranch[val], values);
      }
    }
    // If no match, check for 'any'
    if (flowBranch.hasOwnProperty('any')) {
      return this.traverseFlow(flowBranch['any'], values);
    }
    // If no path found, return empty array
    return [];
  }

  /**
   * Returns progress info for the current step.
   * @param {string} currentStepId
   * @returns {object} { current, total, percent, path }
   */
  getProgress(currentStepId) {
    const storeData = this.formStore.store.get();
    const values = storeData.values || {};
    const flow = storeData.flow || {};

    const key = values.customer_type || "new";

    // Use helper to get path from flow
    let currentFlow = flow[key];
    let path = this.traverseFlow(currentFlow, values);

    let idx = path.indexOf(currentStepId);

    if (idx === -1) {
      // Fallback traversal to build path dynamically
      path = [];
      // Start from the first step in schema
      if (this.schema.length === 0) {
        return {
          current: 0,
          total: 0,
          percent: 0,
          path: [],
        };
      }
      let step = this.schema[0];
      path.push(step.id);

      // Traverse until currentStepId is found or no next step
      while (step.id !== currentStepId) {
        const nextRules = step.next || [];
        let nextStepId = null;

        for (const rule of nextRules) {
          const { value, next } = rule;
          if (value === 'any') {
            nextStepId = next;
            break;
          } else {
            const val = values[rule.key];
            if (typeof value === 'string' && val === value) {
              nextStepId = next;
              break;
            } else if (Array.isArray(value) && value.includes(val)) {
              nextStepId = next;
              break;
            }
          }
        }

        if (!nextStepId) {
          // No next step found
          break;
        }

        path.push(nextStepId);
        step = this.stepMap[nextStepId];
        if (!step) {
          // Step not found in schema
          break;
        }
      }

      idx = path.indexOf(currentStepId);
      if (idx === -1) {
        // If still not found, set idx to 0
        idx = 0;
      }
    }

    const total = path.length;
    const current = idx === -1 ? 0 : idx;
    const percent = total > 1 ? Math.round((current / (total - 1)) * 100) : 0;

    return {
      current: current + 1,
      total,
      percent,
      path,
    };
  }

  /**
   * Renders the progress bar into the FormContainer.
   * @param {string} currentStepId
   */
  render(currentStepId) {
    if (!this.FormContainer) return;
    const progress = this.getProgress(currentStepId);

    const barWrapper = this.FormContainer.querySelector('.progress-bar-wrapper');
    if (!barWrapper) return;

    const bar = barWrapper.querySelector('.progress-bar-fill');
    const label = barWrapper.querySelector('.progress-bar-label');

    if (bar) {
      bar.style.width = progress.percent + '%';
    }
    if (label) {
      label.textContent = `Step ${progress.current} of ${progress.total}`;
    }
  }
}

// Export
