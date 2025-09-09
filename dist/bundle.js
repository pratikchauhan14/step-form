(() => {
  // src/formController.js
  var FormController = class {
    constructor(options) {
      this.data = options.data;
      this.formStore = options.formStore;
      this.formContainer = options.stepForm;
      this.formStoreValue = this.formStore.store.get();
      this.currentStep = this.formStore.getCurrentStep();
      this.navigation = options.navigation;
      this.hsForm = options.hsForm;
      this.thankYouMessage = options.thankYouMessage;
      this.isNext = true;
      this.isPrevious = true;
      this.renderFields();
      this.actionButtons();
      this.watchNextButton();
    }
    // thankYou screen
    thankYou() {
      const existingHeader = this.formContainer.querySelector(".step-header");
      if (existingHeader) {
        existingHeader.remove();
      }
      const existingFields = this.formContainer.querySelector(".step-fields");
      if (existingFields) {
        existingFields.remove();
      }
      const existingButtons = this.formContainer.querySelector("#action-buttons");
      if (existingButtons) {
        existingButtons.remove();
      }
      this.formStore.setCurrentStep("thank_you");
      this.renderFields();
    }
    renderFields() {
      this.formStoreValue = this.formStore.store.get();
      this.currentStep = this.formStore.getCurrentStep();
      if (!this.currentStep?.fields) return;
      const existingHeader = this.formContainer.querySelector(".step-header");
      if (existingHeader) {
        existingHeader.remove();
      }
      const stepHeader = this.div({ tag: "div", className: "step-header" });
      if (this.currentStep.title) {
        const headerTitle = document.createElement("h2");
        headerTitle.textContent = this.currentStep.title;
        stepHeader.appendChild(headerTitle);
      }
      if (this.currentStep.description) {
        const headerDesc = document.createElement("p");
        headerDesc.textContent = this.currentStep.description;
        stepHeader.appendChild(headerDesc);
      }
      const stepWrapper = this.div({ tag: "div", className: "step-fields" });
      const prevErrors = this.formContainer.querySelectorAll(".validation-error");
      prevErrors.forEach((err) => err.remove());
      const typeOfField = typeof this.currentStep.fields;
      if (this.currentStep.id == "hs_form") {
        setTimeout(() => {
          const event = new CustomEvent("form-thank-you", { detail: this.formStore.store.get() });
          document.dispatchEvent(event);
        }, 100);
      }
      if (typeOfField === "string" && this.currentStep.fields === "hubspot_form") {
        this.hsForm.style.display = "block";
        stepWrapper.appendChild(this.hsForm);
        this.formContainer.insertBefore(stepHeader, this.formContainer.firstChild);
        this.formContainer.insertBefore(stepWrapper, stepHeader.nextSibling);
        const event = new CustomEvent("form-thank-you", { detail: this.formStore.store.get() });
        document.dispatchEvent(event);
        return;
      }
      if (typeOfField === "string" && this.currentStep.fields === "thank_you") {
        this.thankYouMessage.style.display = "block";
        stepWrapper.appendChild(this.thankYouMessage);
        this.formContainer.insertBefore(stepHeader, this.formContainer.firstChild);
        this.formContainer.insertBefore(stepWrapper, stepHeader.nextSibling);
        this.formStore.resetForm();
        return;
      }
      this.currentStep.fields.forEach((field) => {
        const depending = field.depending;
        if (field.type === "radio" && field.options) {
          const group = this.div({ tag: "div", className: "field-group" });
          const label = this.div({ tag: "label", className: "field-label", innerHTML: field.label });
          group.appendChild(label);
          const depWrapper = this.div({ tag: "div", className: "dependencies" });
          field.options.forEach((opt) => {
            const optionWrapper = this.div({ tag: "div", className: "radio-option" });
            const input = document.createElement("input");
            input.type = "radio";
            input.name = field.id;
            input.value = opt.id;
            input.checked = this.formStoreValue.values[field.id] === opt.id;
            input.addEventListener("change", () => {
              this.formStore.setFieldValue(field.id, opt.id);
              if (opt.internal_value) {
                this.formStore.addInternalValue(opt.internal_value);
              }
              if (field.isdepending) {
                setTimeout(() => {
                  this.renderDependency(this.currentStep.id, opt.id, field.depending);
                }, 100);
              }
            });
            const optionLabel = this.div({ tag: "span", innerHTML: opt.label });
            optionWrapper.appendChild(input);
            optionWrapper.appendChild(optionLabel);
            group.appendChild(optionWrapper);
          });
          group.appendChild(depWrapper);
          stepWrapper.appendChild(group);
        }
      });
      this.formContainer.insertBefore(stepHeader, this.formContainer.firstChild);
      this.formContainer.insertBefore(stepWrapper, stepHeader.nextSibling);
      this.currentStep.fields.forEach((field) => {
        const depending = field.depending;
        const selectedValue = this.formStoreValue.values[depending];
        if (selectedValue && depending) {
          this.renderDependency(this.currentStep.id, selectedValue, field.depending);
        }
      });
    }
    // --- Refactored: render dependency field(s) for the selected value in current step ---
    renderDependency(stepId, selectedValue, depending) {
      if (!this.currentStep) return;
      this.formStoreValue = this.formStore.store.get();
      let depContainer = document.getElementById(`dep-container-${stepId}`);
      if (!depContainer) {
        depContainer = this.div({ tag: "div", className: "dep-container field-group", id: `dep-container-${stepId}` });
        const stepFieldsWrapper = this.formContainer.querySelector(".step-fields");
        if (stepFieldsWrapper) {
          stepFieldsWrapper.appendChild(depContainer);
        } else {
          this.formContainer.appendChild(depContainer);
        }
      }
      depContainer.innerHTML = "";
      const dependentFields = this.currentStep.fields.filter(
        (f) => f.dependencies && Object.keys(f.dependencies).includes(selectedValue)
      );
      if (!dependentFields.length) return;
      dependentFields.forEach((depField) => {
        const depDef = depField.dependencies[selectedValue];
        const depDefValue = this.formStoreValue.values[depDef.id] || "";
        if (!depDef) return;
        if (depDef.type === "text") {
          const label = this.div({ tag: "label", className: "field-label", innerHTML: depDef.label });
          const input = document.createElement("input");
          input.type = "text";
          input.name = depDef.id;
          input.value = depDefValue;
          input.placeholder = depDef.placeholder || "";
          input.addEventListener("input", (e) => {
            this.formStore.setFieldValue(depDef.id, e.target.value);
          });
          depContainer.appendChild(label);
          depContainer.appendChild(input);
        }
        if (depDef.type === "radio") {
          const label = this.div({ tag: "label", className: "field-label", innerHTML: depDef.label });
          depContainer.appendChild(label);
          depDef.options.forEach((opt) => {
            const optionWrapper = this.div({ tag: "div", className: "radio-option" });
            const input = document.createElement("input");
            input.type = "radio";
            input.name = depDef.id;
            input.value = opt.id;
            input.checked = this.formStoreValue.values[depDef.id] === opt.id;
            input.addEventListener("change", () => {
              this.formStore.setFieldValue(depDef.id, opt.id);
              if (opt.internal_value) {
                this.formStore.addInternalValue(opt.internal_value);
              }
            });
            const optLabel = this.div({ tag: "span", innerHTML: opt.label });
            optionWrapper.appendChild(input);
            optionWrapper.appendChild(optLabel);
            depContainer.appendChild(optionWrapper);
          });
        }
      });
    }
    actionButtons() {
      this.currentStep = this.formStore.getCurrentStep();
      if (this.currentStep.navigation) {
        this.isNext = this.currentStep.navigation.next;
        this.isPrevious = this.currentStep.navigation.prev;
      }
      let div = this.formContainer.querySelector(".action-buttons");
      if (!div) {
        div = this.div({ tag: "div", className: "action-buttons", id: "action-buttons" });
      }
      const nextButton = div.querySelector("#next-button");
      const prevButton = div.querySelector("#prev-button");
      const prevButtonBlank = div.querySelector("#prev-button-blank");
      if (prevButtonBlank) {
        prevButtonBlank.remove();
      }
      if (nextButton) {
        nextButton.remove();
      }
      if (prevButton) {
        prevButton.remove();
      }
      this.nextButton = this.div({ tag: "button", className: "next-button", id: "next-button", innerHTML: this.navigation.next });
      this.nextButton.disabled = true;
      this.nextButton.classList.add("disabled");
      this.prevButton = this.div({ tag: "button", className: "prev-button", id: "prev-button", innerHTML: this.navigation.prev });
      this.prevButtonBlank = this.div({ tag: "div", id: "prev-button-blank" });
      this.isPrevious && div.appendChild(this.prevButton);
      !this.isPrevious && div.appendChild(this.prevButtonBlank);
      this.isNext && div.appendChild(this.nextButton);
      this.formContainer.appendChild(div);
      if (this.currentStep) {
        const canProceed = this.canProceedStep(this.currentStep);
        if (canProceed) {
          this.nextButton.disabled = false;
          this.nextButton.classList.remove("disabled");
        } else {
          this.nextButton.disabled = true;
          this.nextButton.classList.add("disabled");
        }
      }
      this.nextButton.addEventListener("click", () => {
        if (!this.currentStep || !this.currentStep.next) return;
        this.formStoreValue = this.formStore.store.get();
        const isValid = this.validateStep(this.currentStep);
        if (!isValid) {
          return;
        }
        this.formStoreValue = this.formStore.store.get();
        const currentValues = this.formStoreValue.values;
        let nextStepId = null;
        for (const nextEntry of this.currentStep.next) {
          if (nextEntry.value === "any") {
            nextStepId = nextEntry.next;
            break;
          } else {
            const valueToCheck = currentValues[nextEntry.key];
            if (Array.isArray(nextEntry.value)) {
              if (nextEntry.value.includes(valueToCheck)) {
                nextStepId = nextEntry.next;
                break;
              }
            }
            if (typeof nextEntry.value === "string") {
              if (valueToCheck === nextEntry.value) {
                nextStepId = nextEntry.next;
                break;
              }
            }
          }
        }
        if (!nextStepId) {
          nextStepId = this.currentStep.next[0]?.step;
        }
        if (!nextStepId) return;
        this.formStore.setCurrentStep(nextStepId);
        this.currentStep = this.formStore.getCurrentStep();
        this.formStoreValue = this.formStore.store.get();
        const stepFields = this.formContainer.querySelector(".step-fields");
        if (stepFields) {
          stepFields.remove();
        }
        this.isNext = true;
        this.isPrevious = true;
        this.formStore.addChain(this.currentStep.id);
        this.renderFields();
        this.actionButtons();
      });
      this.prevButton.addEventListener("click", () => {
        if (!this.currentStep) return;
        this.formStore.removeChain(this.currentStep.id);
        this.formStore.setCurrentStep(this.formStore.getChain()[this.formStore.getChain().length - 1]);
        this.currentStep = this.formStore.getCurrentStep();
        this.formStoreValue = this.formStore.store.get();
        const stepFields = this.formContainer.querySelector(".step-fields");
        if (stepFields) {
          stepFields.remove();
        }
        this.isNext = true;
        this.isPrevious = true;
        this.renderFields();
        this.actionButtons();
      });
    }
    validateStep(step) {
      this.formStoreValue = this.formStore.store.get();
      const values = this.formStoreValue.values;
      const prevErrors = this.formContainer.querySelectorAll(".validation-error");
      prevErrors.forEach((err) => err.remove());
      let isValid = true;
      if (!step.fields) return true;
      step.fields.forEach((field) => {
        if (field.dependencies) {
          this.formStoreValue = this.formStore.store.get();
          const depValues = this.formStoreValue.values;
          const selectedValue = depValues[field.depending];
          const depDef = field.dependencies[selectedValue];
          if (depDef && depDef.required) {
            const depValue = depValues[depDef.id];
            let depFieldElement = null;
            if (depDef.type === "radio") {
              const radios = this.formContainer.querySelectorAll(`input[type="radio"][name="${depDef.id}"]`);
              const checked = Array.from(radios).some((radio) => radio.checked);
              if (!checked) {
                isValid = false;
                let fieldGroup = null;
                if (radios.length) {
                  let parent = radios[0].parentElement;
                  while (parent && !parent.classList.contains("field-group")) {
                    parent = parent.parentElement;
                  }
                  fieldGroup = parent;
                }
                if (!fieldGroup) {
                  const fgCandidates = this.formContainer.querySelectorAll(".field-group");
                  fgCandidates.forEach((fg) => {
                    if (fg.querySelector(`input[type="radio"][name="${depDef.id}"]`)) {
                      fieldGroup = fg;
                    }
                  });
                }
                if (fieldGroup) {
                  const error = this.div({ className: "validation-error", innerHTML: "This field is required." });
                  fieldGroup.appendChild(error);
                }
              }
            } else {
              if (depValue === void 0 || depValue === null || depValue === "") {
                isValid = false;
                depFieldElement = this.formContainer.querySelector(`.field-group label[for="${depDef.id}"]`) || this.formContainer.querySelector(`.field-group input[name="${depDef.id}"]`)?.parentElement;
                if (!depFieldElement) {
                  depFieldElement = this.formContainer.querySelector(`[name="${depDef.id}"]`) || this.formContainer.querySelector(`#${depDef.id}`);
                }
                if (depFieldElement) {
                  const error = this.div({ className: "validation-error", innerHTML: "This field is required." });
                  depFieldElement.appendChild(error);
                }
              }
            }
          }
          return;
        }
        if (!field.required) return;
        const value = values[field.id];
        let fieldElement = null;
        if (field.type === "radio") {
          const radios = this.formContainer.querySelectorAll(`input[type="radio"][name="${field.id}"]`);
          const checked = Array.from(radios).some((radio) => radio.checked);
          if (!checked) {
            isValid = false;
            let fieldGroup = null;
            if (radios.length) {
              let parent = radios[0].parentElement;
              while (parent && !parent.classList.contains("field-group")) {
                parent = parent.parentElement;
              }
              fieldGroup = parent;
            }
            if (!fieldGroup) {
              const fgCandidates = this.formContainer.querySelectorAll(".field-group");
              fgCandidates.forEach((fg) => {
                if (fg.querySelector(`input[type="radio"][name="${field.id}"]`)) {
                  fieldGroup = fg;
                }
              });
            }
            if (fieldGroup) {
              const error = this.div({ className: "validation-error", innerHTML: "This field is required." });
              fieldGroup.appendChild(error);
            }
          }
        } else {
          const fieldGroup = this.formContainer.querySelector(`.field-group label[for="${field.id}"]`) || this.formContainer.querySelector(`.field-group input[name="${field.id}"]`)?.parentElement;
          if (fieldGroup) {
            fieldElement = fieldGroup;
          } else {
            fieldElement = this.formContainer.querySelector(`[name="${field.id}"]`) || this.formContainer.querySelector(`#${field.id}`);
          }
          if (value === void 0 || value === null || value === "") {
            isValid = false;
            if (fieldElement) {
              const error = this.div({ className: "validation-error", innerHTML: "This field is required." });
              fieldElement.appendChild(error);
            }
          }
        }
      });
      return isValid;
    }
    div({ tag = "div", className = "", id = "", innerHTML = "" }) {
      const div = document.createElement(tag);
      className && (div.className = className);
      id && (div.id = id);
      innerHTML && (div.innerHTML = innerHTML);
      return div;
    }
    /**
      * Checks if all required fields and required dependencies in the given step are filled.
      * Does NOT render any errors.
      * Returns true if the step can proceed, false otherwise.
      */
    canProceedStep(step) {
      this.formStoreValue = this.formStore.store.get();
      const values = this.formStoreValue.values;
      if (!step.fields) return true;
      if (typeof step.fields === "string") {
        return true;
      }
      let isValid = true;
      step.fields.forEach((field) => {
        if (field.dependencies) {
          this.formStoreValue = this.formStore.store.get();
          const depValues = this.formStoreValue.values;
          const selectedValue = depValues[field.depending];
          const depDef = field.dependencies[selectedValue];
          if (depDef && depDef.required) {
            const depValue = depValues[depDef.id];
            if (depDef.type === "radio") {
              if (!depValue) {
                isValid = false;
              }
            } else {
              if (depValue === void 0 || depValue === null || depValue === "") {
                isValid = false;
              }
            }
          }
          return;
        }
        if (!field.required) return;
        const value = values[field.id];
        if (field.type === "radio") {
          if (!value) {
            isValid = false;
          }
        } else {
          if (value === void 0 || value === null || value === "") {
            isValid = false;
          }
        }
      });
      return isValid;
    }
    /**
     * Watches formStore for changes and enables/disables the next button accordingly.
     * Also ensures that on each new step, the Next button starts disabled until required fields are filled.
     */
    watchNextButton() {
      let previousStepId = this.currentStep && this.currentStep.id;
      this.formStore.subscribe(() => {
        this.currentStep = this.formStore.getCurrentStep();
        if (!this.nextButton) return;
        if (this.currentStep && this.currentStep.id !== previousStepId) {
          this.nextButton.disabled = true;
          this.nextButton.classList.add("disabled");
          const canProceedInitial = this.canProceedStep(this.currentStep);
          if (canProceedInitial) {
            this.nextButton.disabled = false;
            this.nextButton.classList.remove("disabled");
          }
          previousStepId = this.currentStep.id;
          return;
        }
        const canProceed = this.canProceedStep(this.currentStep);
        if (canProceed) {
          this.nextButton.disabled = false;
          this.nextButton.classList.remove("disabled");
        } else {
          this.nextButton.disabled = true;
          this.nextButton.classList.add("disabled");
        }
      });
    }
  };

  // node_modules/nanostores/clean-stores/index.js
  var clean = Symbol("clean");

  // node_modules/nanostores/atom/index.js
  var listenerQueue = [];
  var lqIndex = 0;
  var QUEUE_ITEMS_PER_LISTENER = 4;
  var epoch = 0;
  var atom = (initialValue) => {
    let listeners = [];
    let $atom = {
      get() {
        if (!$atom.lc) {
          $atom.listen(() => {
          })();
        }
        return $atom.value;
      },
      lc: 0,
      listen(listener) {
        $atom.lc = listeners.push(listener);
        return () => {
          for (let i = lqIndex + QUEUE_ITEMS_PER_LISTENER; i < listenerQueue.length; ) {
            if (listenerQueue[i] === listener) {
              listenerQueue.splice(i, QUEUE_ITEMS_PER_LISTENER);
            } else {
              i += QUEUE_ITEMS_PER_LISTENER;
            }
          }
          let index = listeners.indexOf(listener);
          if (~index) {
            listeners.splice(index, 1);
            if (!--$atom.lc) $atom.off();
          }
        };
      },
      notify(oldValue, changedKey) {
        epoch++;
        let runListenerQueue = !listenerQueue.length;
        for (let listener of listeners) {
          listenerQueue.push(listener, $atom.value, oldValue, changedKey);
        }
        if (runListenerQueue) {
          for (lqIndex = 0; lqIndex < listenerQueue.length; lqIndex += QUEUE_ITEMS_PER_LISTENER) {
            listenerQueue[lqIndex](
              listenerQueue[lqIndex + 1],
              listenerQueue[lqIndex + 2],
              listenerQueue[lqIndex + 3]
            );
          }
          listenerQueue.length = 0;
        }
      },
      /* It will be called on last listener unsubscribing.
         We will redefine it in onMount and onStop. */
      off() {
      },
      set(newValue) {
        let oldValue = $atom.value;
        if (oldValue !== newValue) {
          $atom.value = newValue;
          $atom.notify(oldValue);
        }
      },
      subscribe(listener) {
        let unbind = $atom.listen(listener);
        listener($atom.value);
        return unbind;
      },
      value: initialValue
    };
    if (true) {
      $atom[clean] = () => {
        listeners = [];
        $atom.lc = 0;
        $atom.off();
      };
    }
    return $atom;
  };

  // node_modules/nanostores/lifecycle/index.js
  var MOUNT = 5;
  var UNMOUNT = 6;
  var REVERT_MUTATION = 10;
  var on = (object, listener, eventKey, mutateStore) => {
    object.events = object.events || {};
    if (!object.events[eventKey + REVERT_MUTATION]) {
      object.events[eventKey + REVERT_MUTATION] = mutateStore((eventProps) => {
        object.events[eventKey].reduceRight((event, l) => (l(event), event), {
          shared: {},
          ...eventProps
        });
      });
    }
    object.events[eventKey] = object.events[eventKey] || [];
    object.events[eventKey].push(listener);
    return () => {
      let currentListeners = object.events[eventKey];
      let index = currentListeners.indexOf(listener);
      currentListeners.splice(index, 1);
      if (!currentListeners.length) {
        delete object.events[eventKey];
        object.events[eventKey + REVERT_MUTATION]();
        delete object.events[eventKey + REVERT_MUTATION];
      }
    };
  };
  var STORE_UNMOUNT_DELAY = 1e3;
  var onMount = ($store, initialize) => {
    let listener = (payload) => {
      let destroy = initialize(payload);
      if (destroy) $store.events[UNMOUNT].push(destroy);
    };
    return on($store, listener, MOUNT, (runListeners) => {
      let originListen = $store.listen;
      $store.listen = (...args) => {
        if (!$store.lc && !$store.active) {
          $store.active = true;
          runListeners();
        }
        return originListen(...args);
      };
      let originOff = $store.off;
      $store.events[UNMOUNT] = [];
      $store.off = () => {
        originOff();
        setTimeout(() => {
          if ($store.active && !$store.lc) {
            $store.active = false;
            for (let destroy of $store.events[UNMOUNT]) destroy();
            $store.events[UNMOUNT] = [];
          }
        }, STORE_UNMOUNT_DELAY);
      };
      if (true) {
        let originClean = $store[clean];
        $store[clean] = () => {
          for (let destroy of $store.events[UNMOUNT]) destroy();
          $store.events[UNMOUNT] = [];
          $store.active = false;
          originClean();
        };
      }
      return () => {
        $store.listen = originListen;
        $store.off = originOff;
      };
    });
  };

  // node_modules/@nanostores/persistent/index.js
  var identity = (a) => a;
  var storageEngine = {};
  var eventsEngine = { addEventListener() {
  }, removeEventListener() {
  } };
  function testSupport() {
    try {
      return typeof localStorage !== "undefined";
    } catch {
      return false;
    }
  }
  if (testSupport()) {
    storageEngine = localStorage;
  }
  var windowPersistentEvents = {
    addEventListener(key, listener, restore) {
      window.addEventListener("storage", listener);
      window.addEventListener("pageshow", restore);
    },
    removeEventListener(key, listener, restore) {
      window.removeEventListener("storage", listener);
      window.removeEventListener("pageshow", restore);
    }
  };
  if (typeof window !== "undefined") {
    eventsEngine = windowPersistentEvents;
  }
  function persistentAtom(name, initial = void 0, opts = {}) {
    let encode = opts.encode || identity;
    let decode = opts.decode || identity;
    let store = atom(initial);
    let set = store.set;
    store.set = (newValue) => {
      let converted = encode(newValue);
      if (typeof converted === "undefined") {
        delete storageEngine[name];
      } else {
        storageEngine[name] = converted;
      }
      set(newValue);
    };
    function listener(e) {
      if (e.key === name) {
        if (e.newValue === null) {
          set(initial);
        } else {
          set(decode(e.newValue));
        }
      } else if (!storageEngine[name]) {
        set(initial);
      }
    }
    function restore() {
      store.set(storageEngine[name] ? decode(storageEngine[name]) : initial);
    }
    onMount(store, () => {
      restore();
      if (opts.listen !== false) {
        eventsEngine.addEventListener(name, listener, restore);
        return () => {
          eventsEngine.removeEventListener(name, listener, restore);
        };
      }
    });
    return store;
  }

  // src/formStore.js
  var FormStore = class {
    constructor(FORM_DATA) {
      this.FORM_DATA = FORM_DATA;
      this.initialState = this._buildInitialState();
      this.store = persistentAtom(
        "step-form",
        this.initialState,
        {
          encode: JSON.stringify,
          decode: JSON.parse
        }
      );
      this.store.listen(() => {
      });
    }
    addInternalValue(value) {
      this.store.set({
        ...this.store.get(),
        internal_values: value
      });
    }
    // Build initial state from FORM_DATA
    _buildInitialState() {
      const state = {
        currentStep: this.FORM_DATA[0].id,
        values: {},
        internal_values: "",
        chain: [this.FORM_DATA[0].id],
        flow: this._buildFlow()
      };
      const collectFields = (fields) => {
        fields.forEach((field) => {
          state.values[field.id] = field.value ?? "";
          if (field.dependencies) {
            Object.values(field.dependencies).forEach((dep) => {
              state.values[dep.id] = dep.value ?? "";
              if (dep.dependencies) {
                collectFields([dep]);
              }
            });
          }
        });
      };
      this.FORM_DATA.forEach((step) => {
        if (Array.isArray(step.fields)) {
          collectFields(step.fields);
        }
      });
      return state;
    }
    _buildFlow() {
      const findStepById = (id) => this.FORM_DATA.find((step) => step.id === id);
      const traverse = (stepId, path = []) => {
        const step = findStepById(stepId);
        if (!step) return null;
        if (!step.next || step.next.length === 0) {
          return [...path, stepId];
        }
        const result = {};
        for (const nextItem of step.next) {
          const nextStepId = nextItem.next;
          if (Array.isArray(nextItem.value)) {
            for (const v of nextItem.value) {
              const nested = traverse(nextStepId, [...path, stepId]);
              if (Array.isArray(nested)) {
                result[v] = nested.filter((id) => id !== "thank_you");
              } else {
                result[v] = nested;
              }
            }
          } else {
            const v = nextItem.value;
            const nested = traverse(nextStepId, [...path, stepId]);
            if (Array.isArray(nested)) {
              result[v] = nested.filter((id) => id !== "thank_you");
            } else {
              result[v] = nested;
            }
          }
        }
        return result;
      };
      const flow = {};
      const firstStep = this.FORM_DATA[0];
      if (!firstStep.next || firstStep.next.length === 0) {
        return flow;
      }
      for (const nextItem of firstStep.next) {
        const nextStepId = nextItem.next;
        if (Array.isArray(nextItem.value)) {
          for (const v of nextItem.value) {
            const nested = traverse(nextStepId, [firstStep.id]);
            if (Array.isArray(nested)) {
              flow[v] = nested.filter((id) => id !== "thank_you");
            } else {
              flow[v] = nested;
            }
          }
        } else {
          const v = nextItem.value;
          const nested = traverse(nextStepId, [firstStep.id]);
          if (Array.isArray(nested)) {
            flow[v] = nested.filter((id) => id !== "thank_you");
          } else {
            flow[v] = nested;
          }
        }
      }
      return flow;
    }
    // --- Actions ---
    get() {
      return this.store.get();
    }
    subscribe(listener) {
      return this.store.subscribe(listener);
    }
    setFieldValue(fieldId, value) {
      const currentState = this.store.get();
      const updatedValues = { ...currentState.values, [fieldId]: value };
      const updateDependentFields = (parentFieldId) => {
        this.FORM_DATA.forEach((step) => {
          if (!Array.isArray(step.fields)) return;
          step.fields.forEach((field) => {
            if (field.depending === parentFieldId) {
              const parentValue = updatedValues[parentFieldId];
              if (field.dependencies && !Object.keys(field.dependencies).includes(parentValue)) {
                updatedValues[field.id] = field.value ?? "";
              }
              updateDependentFields(field.id);
            }
          });
        });
      };
      updateDependentFields(fieldId);
      this.store.set({
        ...currentState,
        values: updatedValues
      });
    }
    setCurrentStep(stepId) {
      this.store.set({
        ...this.store.get(),
        currentStep: stepId
      });
    }
    resetForm() {
      this.store.set(this._buildInitialState());
    }
    // set
    setChain(chain) {
      this.store.set({
        ...this.store.get(),
        chain
      });
    }
    //  get
    getChain() {
      return this.store.get().chain;
    }
    // add
    addChain(chain) {
      this.store.set({
        ...this.store.get(),
        chain: [...this.store.get().chain, chain]
      });
    }
    // remove
    removeChain(chain) {
      this.store.set({
        ...this.store.get(),
        chain: this.store.get().chain.filter((c) => c !== chain)
      });
    }
    // Utility: find current step data
    getCurrentStep() {
      const { currentStep } = this.get();
      return this.FORM_DATA.find((step) => step.id === currentStep);
    }
    getCurrentStepValue() {
      const { currentStep } = this.get();
      return this.store.get().values[currentStep];
    }
  };

  // src/progressBar.js
  var ProgressBar = class {
    /**
     * @param {object} formStore - The form store with current values.
     * @param {object} schema - The form schema (FORM_DATA).
     * @param {HTMLElement} FormContainer - The container to render the progress bar into.
     */
    constructor(formStore, schema, FormContainer) {
      this.formStore = formStore;
      this.schema = schema;
      this.FormContainer = FormContainer;
      this.stepMap = Object.fromEntries(this.schema.map((step) => [step.id, step]));
      this.initWrapper();
      this.formStore.subscribe((state) => {
        this.render(state.currentStep);
        if (state.currentStep === "thank_you") {
          this.progressBar.remove();
        }
      });
    }
    /**
     * Initializes the progress bar wrapper and its child elements if not already present.
     */
    initWrapper() {
      if (!this.FormContainer) return;
      let barWrapper = this.FormContainer.querySelector(".progress-bar-wrapper");
      if (!barWrapper) {
        barWrapper = document.createElement("div");
        barWrapper.className = "progress-bar-wrapper";
        const barContainer = document.createElement("div");
        barContainer.className = "progress-bar";
        const bar = document.createElement("div");
        bar.className = "progress-bar-fill";
        barContainer.appendChild(bar);
        const label = document.createElement("div");
        label.className = "progress-bar-label";
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
      for (const val of Object.values(values)) {
        if (val !== void 0 && flowBranch.hasOwnProperty(val)) {
          return this.traverseFlow(flowBranch[val], values);
        }
      }
      if (flowBranch.hasOwnProperty("any")) {
        return this.traverseFlow(flowBranch["any"], values);
      }
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
      let currentFlow = flow[key];
      let path = this.traverseFlow(currentFlow, values);
      let idx = path.indexOf(currentStepId);
      if (idx === -1) {
        path = [];
        if (this.schema.length === 0) {
          return {
            current: 0,
            total: 0,
            percent: 0,
            path: []
          };
        }
        let step = this.schema[0];
        path.push(step.id);
        while (step.id !== currentStepId) {
          const nextRules = step.next || [];
          let nextStepId = null;
          for (const rule of nextRules) {
            const { value, next } = rule;
            if (value === "any") {
              nextStepId = next;
              break;
            } else {
              const val = values[rule.key];
              if (typeof value === "string" && val === value) {
                nextStepId = next;
                break;
              } else if (Array.isArray(value) && value.includes(val)) {
                nextStepId = next;
                break;
              }
            }
          }
          if (!nextStepId) {
            break;
          }
          path.push(nextStepId);
          step = this.stepMap[nextStepId];
          if (!step) {
            break;
          }
        }
        idx = path.indexOf(currentStepId);
        if (idx === -1) {
          idx = 0;
        }
      }
      const total = path.length;
      const current = idx === -1 ? 0 : idx;
      const percent = total > 1 ? Math.round(current / (total - 1) * 100) : 0;
      return {
        current: current + 1,
        total,
        percent,
        path
      };
    }
    /**
     * Renders the progress bar into the FormContainer.
     * @param {string} currentStepId
     */
    render(currentStepId) {
      if (!this.FormContainer) return;
      const progress = this.getProgress(currentStepId);
      const barWrapper = this.FormContainer.querySelector(".progress-bar-wrapper");
      if (!barWrapper) return;
      const bar = barWrapper.querySelector(".progress-bar-fill");
      const label = barWrapper.querySelector(".progress-bar-label");
      if (bar) {
        bar.style.width = progress.percent + "%";
      }
      if (label) {
        label.textContent = `Step ${progress.current} of ${progress.total}`;
      }
    }
  };

  // src/index.js
  var StepForm = class {
    constructor({ data, navigation, formContainer, hsFormContainer, thankYouMessageContainer }) {
      this.data = data;
      this.navigation = navigation || { next: "Next Step", prev: "Previous Step" };
      this.stepForm = formContainer;
      this.hsForm = hsFormContainer;
      this.thankYouMessage = thankYouMessageContainer;
      this.formStore = new FormStore(data);
      this.formController = new FormController(this);
      this.progressBar = new ProgressBar(this.formStore, data, this.stepForm);
    }
    thankYou() {
      this.formController.thankYou();
    }
    resetForm() {
      this.formStore.resetForm();
    }
  };
  window.StepForm = StepForm;
})();
