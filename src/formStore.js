import { persistentAtom } from "@nanostores/persistent"

export class FormStore {
  constructor(FORM_DATA) {
    this.FORM_DATA = FORM_DATA
    this.initialState = this._buildInitialState()

    this.store = persistentAtom(
      "step-form",
      this.initialState,
      {
        encode: JSON.stringify,
        decode: JSON.parse,
      }
    )
    this.store.listen(() => {})
  }

  // Build initial state from FORM_DATA
  _buildInitialState() {
    const state = { 
      currentStep: this.FORM_DATA[0].id, 
      values: {}, chain: [this.FORM_DATA[0].id],
      flow: this._buildFlow()
    }
  
    const collectFields = (fields) => {
      fields.forEach(field => {
        // Always add the main field
        state.values[field.id] = field.value ?? ""
  
        // If dependencies exist, recurse through them
        if (field.dependencies) {
          Object.values(field.dependencies).forEach(dep => {
            state.values[dep.id] = dep.value ?? ""
            if (dep.dependencies) {
              collectFields([dep]) // recursion for nested dependencies
            }
          })
        }
      })
    }
  
    this.FORM_DATA.forEach(step => {
      if (Array.isArray(step.fields)) {
        collectFields(step.fields)
      }
    })
  
    return state
  }

  _buildFlow(){
    const findStepById = (id) => this.FORM_DATA.find(step => step.id === id)

    const traverse = (stepId, path=[]) => {
      const step = findStepById(stepId)
      if (!step) return null

      if (!step.next || step.next.length === 0) {
        return [...path, stepId]
      }

      const result = {}

      for (const nextItem of step.next) {
        const nextStepId = nextItem.next
        if (Array.isArray(nextItem.value)) {
          for (const v of nextItem.value) {
            const nested = traverse(nextStepId, [...path, stepId])
            if (Array.isArray(nested)) {
              result[v] = nested.filter(id => id !== 'thank_you');
            } else {
              result[v] = nested;
            }
          }
        } else {
          const v = nextItem.value
          const nested = traverse(nextStepId, [...path, stepId])
          if (Array.isArray(nested)) {
            result[v] = nested.filter(id => id !== 'thank_you');
          } else {
            result[v] = nested;
          }
        }
      }

      return result
    }

    const flow = {}
    const firstStep = this.FORM_DATA[0]
    if (!firstStep.next || firstStep.next.length === 0) {
      return flow
    }

    for (const nextItem of firstStep.next) {
      const nextStepId = nextItem.next
      if (Array.isArray(nextItem.value)) {
        for (const v of nextItem.value) {
          const nested = traverse(nextStepId, [firstStep.id])
          if (Array.isArray(nested)) {
            flow[v] = nested.filter(id => id !== 'thank_you');
          } else {
            flow[v] = nested;
          }
        }
      } else {
        const v = nextItem.value
        const nested = traverse(nextStepId, [firstStep.id])
        if (Array.isArray(nested)) {
          flow[v] = nested.filter(id => id !== 'thank_you');
        } else {
          flow[v] = nested;
        }
      }
    }

    return flow
  }

  // --- Actions ---

  get() {
    return this.store.get()
  }

  subscribe(listener) {
    return this.store.subscribe(listener)
  }

  setFieldValue(fieldId, value) {
    const currentState = this.store.get();
    const updatedValues = { ...currentState.values, [fieldId]: value };

    // Only reset dependent fields if their parent value is no longer valid for their dependencies
    const updateDependentFields = (parentFieldId) => {
      this.FORM_DATA.forEach(step => {
        if (!Array.isArray(step.fields)) return;
        step.fields.forEach(field => {
          if (field.depending === parentFieldId) {
            const parentValue = updatedValues[parentFieldId];
            if (
              field.dependencies &&
              !Object.keys(field.dependencies).includes(parentValue)
            ) {
              updatedValues[field.id] = field.value ?? '';
            }
            updateDependentFields(field.id);
          }
        });
      });
    };

    updateDependentFields(fieldId);

    this.store.set({
      ...currentState,
      values: updatedValues,
    });
  }

  setCurrentStep(stepId) {
    this.store.set({
      ...this.store.get(),
      currentStep: stepId,
    })
  }

  resetForm() {
    this.store.set(this._buildInitialState())
    // this.store.set({
    //   ...this.store.get(),
    //   values: {},
    // })
  }

  // set
  setChain(chain) {
    this.store.set({
      ...this.store.get(),
      chain: chain,
    })
  }

  //  get
  getChain() {
    return this.store.get().chain
  }

  // add
  addChain(chain) {
    this.store.set({
      ...this.store.get(),
      chain: [...this.store.get().chain, chain],
    })
  }

  // remove
  removeChain(chain) {
    this.store.set({
      ...this.store.get(),
      chain: this.store.get().chain.filter(c => c !== chain),
    })
  }

  // Utility: find current step data
  getCurrentStep() {
    const { currentStep } = this.get()
    return this.FORM_DATA.find(step => step.id === currentStep)
  }

  getCurrentStepValue() {
    const { currentStep } = this.get()
    return this.store.get().values[currentStep]
  }
}