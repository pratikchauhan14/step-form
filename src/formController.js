export class FormController {
  constructor(options) {
    this.data = options.data;
    this.formStore = options.formStore;
    this.formContainer = options.stepForm;
    this.formStoreValue = this.formStore.store.get();
    this.currentStep = this.formStore.getCurrentStep();

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
    // thank_you id set

    // remove existing .step-header
    const existingHeader = this.formContainer.querySelector('.step-header');
    if (existingHeader) {
      existingHeader.remove();
    }

    // remove existing .step-fields
    const existingFields = this.formContainer.querySelector('.step-fields');
    if (existingFields) {
      existingFields.remove();
    }

    // remove existing .action-buttons
    const existingButtons = this.formContainer.querySelector('#action-buttons');
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

    // Remove any existing .step-header to prevent duplicates
    const existingHeader = this.formContainer.querySelector('.step-header');
    if (existingHeader) {
      existingHeader.remove();
    }

    // Create the step header container
    const stepHeader = this.div({ tag: "div", className: "step-header" });
    // Add the title as h2
    if (this.currentStep.title) {
      const headerTitle = document.createElement("h2");
      headerTitle.textContent = this.currentStep.title;
      stepHeader.appendChild(headerTitle);
    }
    // Add the description as p
    if (this.currentStep.description) {
      const headerDesc = document.createElement("p");
      headerDesc.textContent = this.currentStep.description;
      stepHeader.appendChild(headerDesc);
    }

    const stepWrapper = this.div({ tag: "div", className: "step-fields" });

    // Clear any previous validation errors
    const prevErrors = this.formContainer.querySelectorAll(".validation-error");
    prevErrors.forEach(err => err.remove());

    const typeOfField = typeof this.currentStep.fields;

    // hs_form
    if (typeOfField === "string" && this.currentStep.fields === "hubspot_form") {
      this.hsForm.style.display = "block";
      stepWrapper.appendChild(this.hsForm);
      // Insert header before fields
      this.formContainer.insertBefore(stepHeader, this.formContainer.firstChild);
      this.formContainer.insertBefore(stepWrapper, stepHeader.nextSibling);

      // custom event trigger and pass store data
      const event = new CustomEvent("form-thank-you", { detail: this.formStore.store.get() });
      document.dispatchEvent(event);
      return;
    }

    // thank_you
    if (typeOfField === "string" && this.currentStep.fields === "thank_you") {
      this.thankYouMessage.style.display = "block";
      stepWrapper.appendChild(this.thankYouMessage);
      // Insert header before fields
      this.formContainer.insertBefore(stepHeader, this.formContainer.firstChild);
      this.formContainer.insertBefore(stepWrapper, stepHeader.nextSibling);
      this.formStore.resetForm();
      return;
    }

    this.currentStep.fields.forEach(field => {

      const depending = field.depending;

      // --- radio field ---
      if (field.type === "radio" && field.options) {
        const group = this.div({ tag: "div", className: "field-group" });

        const label = this.div({ tag: "label", className: "field-label", innerHTML: field.label });
        group.appendChild(label);

        const depWrapper = this.div({ tag: "div", className: "dependencies" }); // placeholder
        field.options.forEach(opt => {
          const optionWrapper = this.div({ tag: "div", className: "radio-option" });

          const input = document.createElement("input");
          input.type = "radio";
          input.name = field.id;
          input.value = opt.id;
          input.checked = this.formStoreValue.values[field.id] === opt.id;

          input.addEventListener("change", () => {
            // console.log("opt", opt , field.id);
            this.formStore.setFieldValue(field.id, opt.id);
            // console.log("field.depending", field.isdepending);
            if (field.isdepending) {
              // console.log("depending", depending);
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

        group.appendChild(depWrapper); // append placeholder after radio
        stepWrapper.appendChild(group);
      }
    });

    // Insert header, then stepWrapper as first children of formContainer
    this.formContainer.insertBefore(stepHeader, this.formContainer.firstChild);
    this.formContainer.insertBefore(stepWrapper, stepHeader.nextSibling);
    this.currentStep.fields.forEach(field => {
      const depending = field.depending;
      const selectedValue = this.formStoreValue.values[depending];
      // console.log("selectedValue", selectedValue, depending);
      if (selectedValue && depending) {
        this.renderDependency(this.currentStep.id, selectedValue, field.depending);
      }
    });
  }

  // --- Refactored: render dependency field(s) for the selected value in current step ---
  renderDependency(stepId, selectedValue, depending) {


    // Removed step lookup from store; using this.currentStep directly
    if (!this.currentStep) return;
    this.formStoreValue = this.formStore.store.get();

    // Create/find a dedicated container for dependencies for this step
    let depContainer = document.getElementById(`dep-container-${stepId}`);

    if (!depContainer) {
      depContainer = this.div({ tag: "div", className: "dep-container field-group", id: `dep-container-${stepId}` });
      // Append after the main step fields
      const stepFieldsWrapper = this.formContainer.querySelector(".step-fields");
      if (stepFieldsWrapper) {
        stepFieldsWrapper.appendChild(depContainer);
      } else {
        this.formContainer.appendChild(depContainer);
      }
    }
    depContainer.innerHTML = ""; // clear all previous dependencies

    // Find all fields in the current step that have a dependency for this selected value
    const dependentFields = this.currentStep.fields.filter(f =>
      f.dependencies && Object.keys(f.dependencies).includes(selectedValue)
    );
    if (!dependentFields.length) return;

    dependentFields.forEach(depField => {
      const depDef = depField.dependencies[selectedValue];
      const depDefValue = this.formStoreValue.values[depDef.id] || "";
      // console.log("depDef--->", depDef.id , "depDefValue--->", depDefValue);
      if (!depDef) return;

      if (depDef.type === "text") {
        const label = this.div({ tag: "label", className: "field-label", innerHTML: depDef.label });
        const input = document.createElement("input");
        input.type = "text";
        input.name = depDef.id;
        input.value = depDefValue;
        input.placeholder = depDef.placeholder || "";
        input.addEventListener("input", e => {
          console.log("e.target.value--->", e.target.value);
          console.log("depDef.id--->", depDef.id);
          this.formStore.setFieldValue(depDef.id, e.target.value);
        });
        depContainer.appendChild(label);
        depContainer.appendChild(input);
      }

      if (depDef.type === "radio") {
        const label = this.div({ tag: "label", className: "field-label", innerHTML: depDef.label });
        depContainer.appendChild(label);
        depDef.options.forEach(opt => {
          const optionWrapper = this.div({ tag: "div", className: "radio-option" });
          const input = document.createElement("input");
          input.type = "radio";
          input.name = depDef.id;
          input.value = opt.id;
          input.checked = this.formStoreValue.values[depDef.id] === opt.id;
          input.addEventListener("change", () => {
            this.formStore.setFieldValue(depDef.id, opt.id);
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

    // remove next-button and prev-button if they exist
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


    this.nextButton = this.div({ tag: "button", className: "next-button", id: "next-button", innerHTML: "Next" });
    // default: disabled until store/subscriber says otherwise
    this.nextButton.disabled = true;
    this.nextButton.classList.add("disabled");
    this.prevButton = this.div({ tag: "button", className: "prev-button", id: "prev-button", innerHTML: "Previous" });
    this.prevButtonBlank = this.div({ tag: "div", id: "prev-button-blank" });


    this.isPrevious && div.appendChild(this.prevButton);
    !this.isPrevious && div.appendChild(this.prevButtonBlank);
    this.isNext && div.appendChild(this.nextButton);

    this.formContainer.appendChild(div);
    // Immediately check if the step is already valid and update Next button state
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
      // Always refresh store value before validation
      this.formStoreValue = this.formStore.store.get();

      // Validate current step before moving forward
      const isValid = this.validateStep(this.currentStep);
      console.log("isValid", isValid);
      if (!isValid) {
        // Do not proceed if validation fails
        return;
      }

      // Refresh store value again to ensure latest for navigation
      this.formStoreValue = this.formStore.store.get();
      const currentValues = this.formStoreValue.values;

      // Determine next step based on matching currentValues[nextEntry.key] against nextEntry.value
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
        // fallback to first next step if no match found
        nextStepId = this.currentStep.next[0]?.step;
      }
      if (!nextStepId) return;

      this.formStore.setCurrentStep(nextStepId);
      this.currentStep = this.formStore.getCurrentStep();
      this.formStoreValue = this.formStore.store.get();

      // want to remove only step-fields
      const stepFields = this.formContainer.querySelector(".step-fields");
      if (stepFields) {
        stepFields.remove();
      }

      this.isNext = true;
      this.isPrevious = true;

      this.formStore.addChain(this.currentStep.id);
      // Re-render fields and buttons
      this.renderFields();
      this.actionButtons();
    });

    // previous
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
    // Always fetch the latest store values at the start
    this.formStoreValue = this.formStore.store.get();
    const values = this.formStoreValue.values;

    // Clear previous validation errors
    const prevErrors = this.formContainer.querySelectorAll(".validation-error");
    prevErrors.forEach(err => err.remove());

    let isValid = true;

    if (!step.fields) return true;

    step.fields.forEach(field => {
      // If the field has dependencies, skip validation of the main field itself,
      // and validate only the currently active dependent field (if any).
      if (field.dependencies) {
        // Always fetch the latest store values before dependency validation
        this.formStoreValue = this.formStore.store.get();
        const depValues = this.formStoreValue.values;
        const selectedValue = depValues[field.depending];
        const depDef = field.dependencies[selectedValue];
        // Debug log: main field with dependencies (skipping main field validation)
        console.log(
          `[Validation] Main field with dependencies: id=${field.id}, type=${field.type}, required=${!!field.required}, value=${values[field.id]}`
        );
        if (depDef && depDef.required) {
          // Debug log: dependent field validation
          console.log(
            `[Validation] Dependent field: id=${depDef.id}, parent=${field.depending}, selectedParentValue=${selectedValue}, type=${depDef.type}, required=${!!depDef.required}, value=${depValues[depDef.id]}`
          );
          // Use the current value of the dependency field from the updated store
          const depValue = depValues[depDef.id];
          let depFieldElement = null;

          if (depDef.type === "radio") {
            // For radio, check if any radio input with name=depDef.id is checked
            const radios = this.formContainer.querySelectorAll(`input[type="radio"][name="${depDef.id}"]`);
            const checked = Array.from(radios).some(radio => radio.checked);
            if (!checked) {
              isValid = false;
              console.log(
                `[Validation] Dependent field validation failed: id=${depDef.id}, type=${depDef.type}`
              );
              // Find the container holding all radio options for the field (.field-group)
              let fieldGroup = null;
              // Try to find the closest .field-group that contains the radios
              if (radios.length) {
                // Go up from first radio to .field-group
                let parent = radios[0].parentElement;
                while (parent && !parent.classList.contains("field-group")) {
                  parent = parent.parentElement;
                }
                fieldGroup = parent;
              }
              // fallback: find any .field-group containing input[name=depDef.id]
              if (!fieldGroup) {
                const fgCandidates = this.formContainer.querySelectorAll(".field-group");
                fgCandidates.forEach(fg => {
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
            // For other input types (like text)
            if (depValue === undefined || depValue === null || depValue === "") {
              isValid = false;
              console.log(
                `[Validation] Dependent field validation failed: id=${depDef.id}, type=${depDef.type}`
              );
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
        // Skip main field validation entirely if dependencies exist
        return;
      }

      // Debug log: main field validation
      console.log(
        `[Validation] Main field: id=${field.id}, type=${field.type}, required=${!!field.required}, value=${values[field.id]}`
      );

      if (!field.required) return;

      const value = values[field.id];

      let fieldElement = null;

      if (field.type === "radio") {
        // For radio, check if any radio input with name=field.id is checked
        const radios = this.formContainer.querySelectorAll(`input[type="radio"][name="${field.id}"]`);
        const checked = Array.from(radios).some(radio => radio.checked);
        if (!checked) {
          isValid = false;
          console.log(
            `[Validation] Main field validation failed: id=${field.id}, type=${field.type}`
          );
          // Find the container holding all radio options for the field (.field-group)
          let fieldGroup = null;
          if (radios.length) {
            // Go up from first radio to .field-group
            let parent = radios[0].parentElement;
            while (parent && !parent.classList.contains("field-group")) {
              parent = parent.parentElement;
            }
            fieldGroup = parent;
          }
          // fallback: find any .field-group containing input[name=field.id]
          if (!fieldGroup) {
            const fgCandidates = this.formContainer.querySelectorAll(".field-group");
            fgCandidates.forEach(fg => {
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
        // Not a radio: use original field lookup
        const fieldGroup = this.formContainer.querySelector(`.field-group label[for="${field.id}"]`) || this.formContainer.querySelector(`.field-group input[name="${field.id}"]`)?.parentElement;
        if (fieldGroup) {
          fieldElement = fieldGroup;
        } else {
          // fallback to find input or label by name/id
          fieldElement = this.formContainer.querySelector(`[name="${field.id}"]`) || this.formContainer.querySelector(`#${field.id}`);
        }
        if (value === undefined || value === null || value === "") {
          isValid = false;
          console.log(
            `[Validation] Main field validation failed: id=${field.id}, type=${field.type}`
          );
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
    // Always fetch the latest store values at the start
    this.formStoreValue = this.formStore.store.get();
    const values = this.formStoreValue.values;
    if (!step.fields) return true;
    if (typeof step.fields === "string") {
      return true;
    }

    let isValid = true;
    step.fields.forEach(field => {
      // If the field has dependencies, skip main field, check required dependency only
      if (field.dependencies) {
        this.formStoreValue = this.formStore.store.get();
        const depValues = this.formStoreValue.values;
        const selectedValue = depValues[field.depending];
        const depDef = field.dependencies[selectedValue];
        if (depDef && depDef.required) {
          const depValue = depValues[depDef.id];
          if (depDef.type === "radio") {
            // For radio, check if any value is set
            if (!depValue) {
              isValid = false;
            }
          } else {
            if (depValue === undefined || depValue === null || depValue === "") {
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
        if (value === undefined || value === null || value === "") {
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
      // Always get the latest step reference
      this.currentStep = this.formStore.getCurrentStep();
      if (!this.nextButton) return;
      // If the step has changed, handle initial render for the new step
      if (this.currentStep && this.currentStep.id !== previousStepId) {
        // Always start disabled and with "disabled" class on new step
        this.nextButton.disabled = true;
        this.nextButton.classList.add("disabled");
        // Now check if it should be enabled immediately (e.g. all required fields already filled)
        const canProceedInitial = this.canProceedStep(this.currentStep);
        if (canProceedInitial) {
          this.nextButton.disabled = false;
          this.nextButton.classList.remove("disabled");
        }
        previousStepId = this.currentStep.id;
        return;
      }
      // For all other updates, just toggle according to canProceed
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
}
