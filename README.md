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
        id:"step_1",
        title:"Contact & Support",
        description:"",
        navigation:{
            next:true,
            prev:false
        },
        next:[
            { value:["private","business"], next:"step_2" , key:"customer_type" },
            { value:"new", next:"hs_form" , key:"customer_type" }
        ],
        fields:[
            {
                id:"customer_type", type:"radio", label:"Customer Type", required:true, value:"",
                isdepending:true,
                options:[
                    {id:"private", label:"Private Customer"},
                    {id:"business", label:"Business Customer"},
                    {id:"new", label:"New Customer"}
                ],
            },
            {
                id:"customer_name_private", type:"text", depending:"customer_type", label:"Customer Name", required:true, value:"",
                dependencies:{
                    "private":{
                        type:"text", id:"customer_name_private", label:"Customer Name", required:true, value:"", placeholder:"Private Customer Name",
                        if:{ value:"private" }
                    },
                    "business":{
                        type:"text", id:"customer_name_business", label:"Customer Name", required:true, value:"", placeholder:"Business Customer Name",
                        if:{ value:"business" }
                    }
                }
            }
        ]
    },
    {
        id:"step_2",
        title:"Category (Level 1)",
        description:"",
        next:[
            { value:"Technical Issues", next:"step_3" , key:"category_1" },
            { value:"General Inquiries / Contract Changes", next:"step_4" , key:"category_1" }
        ],
        fields:[
            {
                id:"category_1", type:"radio", label:"Category 1", required:true, value:"",
                options:[
                    {id:"Technical Issues", label:"Technical Issues"},
                    {id:"General Inquiries / Contract Changes", label:"General Inquiries / Contract Changes"},
                ],
            },
        ]
    },
    {
        id:"step_3",
        title:"Select Location",
        description:"Choose your country and state",
        next:[
            { value:"any", next:"hs_form"}
        ],
        fields:[
            {
                id:"country", type:"radio", label:"Country", required:true, value:"",
                isdepending:true,
                options:[
                    {id:"usa", label:"United States"},
                    {id:"india", label:"India"}
                ],
            },
            {
                id:"state", type:"radio", label:"State", required:true, value:"",
                depending:"country",
                dependencies:{
                    "usa":{
                        type:"radio", id:"usa_states", label:"Select State (USA)", required:true, value:"",
                        options:[
                            {id:"california", label:"California", internal_value:"USA > California"},
                            {id:"new_york", label:"New York", internal_value:"USA > New York"},
                            {id:"texas", label:"Texas", internal_value:"USA > Texas"}
                        ]
                    },
                    "india":{
                        type:"radio", id:"india_states", label:"Select State (India)", required:true, value:"",
                        options:[
                            {id:"maharashtra", label:"Maharashtra", internal_value:"India > Maharashtra"},
                            {id:"karnataka", label:"Karnataka", internal_value:"India > Karnataka"},
                            {id:"delhi", label:"Delhi", internal_value:"India > Delhi"}
                        ]
                    }
                }
            }
        ]
    },
    {
        id:"step_4",
        title:"Topic (Level 2)",
        description:"Topic (Level 2) Description",
        next:[
            { value:"any", next:"hs_form"}
        ],
        fields:[
            {
                id:"topic_category", type:"radio", label:"Choose a Topic", required:true, value:"",
                isdepending:true,
                options:[
                    {id:"billing", label:"Billing"},
                    {id:"technical", label:"Technical"},
                    {id:"account", label:"Account"},
                    {id:"general", label:"General"}
                ],
            },
            {
                id:"topic_detail", type:"radio", label:"Topic Details", required:true, value:"",
                depending:"topic_category",
                dependencies:{
                    "billing":{
                        type:"radio", id:"billing_details", label:"Billing Details", required:true, value:"",
                        options:[
                            {id:"invoice", label:"Invoice Issue", internal_value:"Billing > Invoice Issue"},
                            {id:"refund", label:"Refund Request", internal_value:"Billing > Refund Request"},
                            {id:"other", label:"Other Billing Issue", internal_value:"Billing > Other"}
                        ]
                    },
                    "technical":{
                        type:"radio", id:"technical_details", label:"Technical Details", required:true, value:"",
                        options:[
                            {id:"login", label:"Login Issue", internal_value:"Technical > Login Issue"},
                            {id:"performance", label:"Performance Issue", internal_value:"Technical > Performance Issue"},
                            {id:"bug", label:"Bug Report", internal_value:"Technical > Bug Report"}
                        ]
                    },
                    "account":{
                        type:"radio", id:"account_details", label:"Account Details", required:true, value:"",
                        options:[
                            {id:"update", label:"Update Information", internal_value:"Account > Update Information"},
                            {id:"close", label:"Close Account", internal_value:"Account > Close Account"},
                            {id:"security", label:"Security Concern", internal_value:"Account > Security Concern"}
                        ]
                    },
                    "general":{
                        type:"radio", id:"general_details", label:"General Inquiry", required:true, value:"",
                        options:[
                            {id:"feedback", label:"Feedback", internal_value:"General > Feedback"},
                            {id:"support", label:"Support Question", internal_value:"General > Support Question"},
                            {id:"other", label:"Other Inquiry", internal_value:"General > Other"}
                        ]
                    }
                },
            },
        ]
    },
    {
        id:"hs_form",
        title:"HubSpot Form",
        description:"HubSpot Form Description",
        fields:"hubspot_form",
        next:[
            { value:"any", next:"thank_you"}
        ],
        navigation:{
            next:false,
            prev:true
        }
    },
    {
        id:"thank_you",
        title:"",
        description:"",
        fields:"thank_you",
        navigation:{
            next:false,
            prev:false
        }
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

---

## Contact & Collaboration

**Developer Name:** Pratik Chauhan  
**Website:** https://2cube.studio/  
**Email:** pratik@2cube.studio

If you have any questions, encounter issues, or have ideas for collaboration, please don't hesitate to reach out. Your feedback and contributions are always welcome!
