# Step-Form Project

## Project Description

The Step-Form project is a multi-step dynamic form system designed to handle complex form workflows with dependencies, validation, and a progress bar. It supports conditional navigation between steps based on user input, dynamic field rendering, and validation rules that ensure data integrity throughout the process. The form schema is highly customizable, allowing for various field types, dependency conditions, and special step types such as embedded HubSpot forms and thank-you screens.

---

## Setup Instructions

1. **Install Dependencies**

   Ensure you have Node.js installed, then run:

   ```bash
   npm install
   ```

2. **Build or Run in Development Mode**

   This project uses [esbuild](https://esbuild.github.io/) for bundling. To build the project, run:

   ```bash
   npm run build
   ```

   To start a development server with live reload:

   ```bash
   npm run dev
   ```

---

## Form Schema Explanation

The form schema defines the structure and behavior of the multi-step form. It is an array of step objects, each describing a step's metadata, navigation logic, and fields.

### Step Properties

- `id`: Unique identifier for the step.
- `title`: Display title for the step.
- `description`: Optional description shown under the title.
- `navigation`: Object controlling navigation buttons visibility:
  - `next` (boolean): Show or hide the "Next" button.
  - `prev` (boolean): Show or hide the "Previous" button.
- `fields`: Array of field definitions or special strings for unique step types.

### Field Properties

Each field object can have:

- `id`: Unique identifier for the field.
- `type`: Field type (e.g., `"radio"`, `"text"`, `"hubspot_form"`, `"thank_you"`).
- `label`: Label text for the field.
- `options`: For fields like radio buttons, an array of `{ label, value }` options.
- `required`: Boolean indicating if the field is mandatory.
- `depending`: Boolean indicating if the field depends on other fields.
- `dependencies`: Object mapping field IDs to values this field depends on.
- `next`: Array of navigation rules, each with:
  - `key`: Field ID to check.
  - `value`: Value to match.
  - `next`: Step ID to navigate to if the condition matches.

### Special Field Types

- `"hubspot_form"`: Embeds a HubSpot form within the step.
- `"thank_you"`: Displays a thank-you message or screen at the end of the form.

---

### Full Example Schema

```json
[
  {
    "id": "step1",
    "title": "Personal Information",
    "description": "Please provide your details",
    "navigation": { "next": true, "prev": false },
    "fields": [
      {
        "id": "name",
        "type": "text",
        "label": "Full Name",
        "required": true
      },
      {
        "id": "contact_method",
        "type": "radio",
        "label": "Preferred Contact Method",
        "options": [
          { "label": "Email", "value": "email" },
          { "label": "Phone", "value": "phone" }
        ],
        "required": true,
        "next": [
          { "key": "contact_method", "value": "email", "next": "step2_email" },
          { "key": "contact_method", "value": "phone", "next": "step2_phone" }
        ]
      }
    ]
  },
  {
    "id": "step2_email",
    "title": "Email Details",
    "description": "Enter your email address",
    "navigation": { "next": true, "prev": true },
    "fields": [
      {
        "id": "email",
        "type": "text",
        "label": "Email Address",
        "required": true
      }
    ]
  },
  {
    "id": "step2_phone",
    "title": "Phone Details",
    "description": "Enter your phone number",
    "navigation": { "next": true, "prev": true },
    "fields": [
      {
        "id": "phone",
        "type": "text",
        "label": "Phone Number",
        "required": true
      }
    ]
  },
  {
    "id": "step3",
    "title": "Additional Information",
    "description": "Tell us more about yourself",
    "navigation": { "next": true, "prev": true },
    "fields": [
      {
        "id": "newsletter",
        "type": "radio",
        "label": "Subscribe to newsletter?",
        "options": [
          { "label": "Yes", "value": "yes" },
          { "label": "No", "value": "no" }
        ],
        "required": true,
        "depending": true,
        "dependencies": { "contact_method": "email" }
      }
    ]
  },
  {
    "id": "step4",
    "title": "HubSpot Integration",
    "description": "Please fill out the HubSpot form below",
    "navigation": { "next": false, "prev": true },
    "fields": ["hubspot_form"]
  },
  {
    "id": "thank_you",
    "title": "Thank You!",
    "description": "Your submission has been received.",
    "navigation": { "next": false, "prev": false },
    "fields": ["thank_you"]
  }
]
```

---

## Navigation

Navigation between steps is controlled by the `navigation` object in each step:

- `next`: When `true`, the "Next" button is shown.
- `prev`: When `true`, the "Previous" button is shown.

Additionally, the `next` array inside fields can define conditional navigation rules based on user input. For example, selecting a specific radio button value can direct the form to a particular next step.

---

## Validation

Validation ensures that required fields are filled before moving forward. Key points:

- Fields with `required: true` must have a value.
- Fields with dependencies (`depending: true`) are validated only if their dependency conditions (`dependencies` map) are met.
- Validation runs on the current step before allowing navigation to the next step.
- If validation fails, the user is prompted to complete the necessary fields.

---

## Initializing and Rendering the Form

To initialize and render the form, import the schema and use a form rendering function. Example:

```js
import formSchema from './formSchema.json';
import { renderStepForm } from './formRenderer';

function initializeForm() {
  renderStepForm({
    schema: formSchema,
    containerId: 'form-container',
    onSubmit: (formData) => {
      console.log('Form submitted:', formData);
    }
  });
}

initializeForm();
```

This example assumes you have a `renderStepForm` function that takes the schema, renders the steps inside the container with ID `form-container`, and handles submission.

---

## Handling the Thank You Step

To navigate to the thank you step programmatically, call the `thankYou` method on your form instance:

```js
stepForm.thankYou();
```

You can listen for the `form-thank-you` event to perform actions when the thank you step is reached. The event is dispatched on the `document` and contains the submitted form values in `event.detail`:

```js
document.addEventListener('form-thank-you', (event) => {
  const submittedValues = event.detail;
  console.log('Form submitted values:', submittedValues);
  // Perform any additional actions here
});
```

This allows you to handle post-submission logic, such as analytics tracking or UI updates, when the form reaches the thank you step.

---

## Progress Bar Behavior

The progress bar reflects the user's progress through the form steps:

- It listens to the form's store or state to track the current step.
- It excludes steps of type `"thank_you"` from the progress calculation.
- Progress updates dynamically as the user navigates forward or backward.
- It visually indicates completed, current, and pending steps.

---

## Customizing and Extending the Schema

- **Adding New Field Types**: Extend the renderer to support new field types by adding their definitions and UI components.
- **Complex Dependencies**: Use nested dependency maps to create complex conditional fields.
- **Custom Navigation Logic**: Add more rules in the `next` array for finer control over step flow.
- **Styling**: Customize the UI by modifying CSS or component styles.
- **Localization**: Add support for multiple languages by externalizing strings like titles and labels.

---

This guide provides a comprehensive overview to get started with the Step-Form project, customize it, and extend it to fit your specific needs.
