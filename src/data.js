export const FORM_DATA = [
    {
        id:"step_1",
        title:"Kontakt & Support",
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
                    {id:"new", label:"New customer"}
                ],
            },
            {
                id:"customer_name_private", type:"text", depending:"customer_type", label:"Customer Name", required:true, value:"",
                dependencies:{
                    "private":{
                        type:"text", id:"customer_name_private", label:"Customer Name", required:true, value:"", placeholder:"private Customer Name",
                        if:{ value:"private" }
                    },
                    "business":{
                        type:"text", id:"customer_name_business", label:"Customer Name", required:true, value:"", placeholder:"business Customer Name",
                        if:{ value:"business" }
                    }
                }
            }
        ]
    },
    {
        id:"step_2",
        title:"Kategorie (Kategorie 1)",
        description:"",
        next:[
            { value:"Technische Störungen", next:"category_1_value_1" , key:"category_1" },
            { value:"Allgemeine Anfragen / Vertragsänderungen", next:"category_1_value_2" , key:"category_1" }
        ],
        fields:[
            {
                id:"category_1", type:"radio", label:"Category 1", required:true, value:"",
                options:[
                    {id:"Technische Störungen", label:"Technische Störungen"},
                    {id:"Allgemeine Anfragen / Vertragsänderungen", label:"Allgemeine Anfragen / Vertragsänderungen"},
                ],
            },
        ]
    },
    {
        id:"category_1_value_1",
        title:"Thema (Kartegorie 2)",
        description:"Thema (Kartegorie 2) Description",
        next:[
            { value:"any", next:"hs_form"}
        ],
        fields:[
            {
                id:"category_1_value_1_field", type:"radio", label:"Category 1 Value 1", required:true, value:"",
                isdepending:true,
                options:[
                    {id:"Internet", label:"Internet"},
                    {id:"Telefonie", label:"Telefonie"},
                    {id:"TV-COAX", label:"TV-COAX"},
                    {id:"WAIPU-TV", label:"WAIPU-TV"},
                    {id:"Hardware", label:"Hardware"},
                    {id:"Intern", label:"Intern"}
                ],
            },
            {
                id:"category_1_value_1_1", type:"radio", label:"Anliegen (Kategorie 3)", required:true, value:"",
                depending:"category_1_value_1_field",
                dependencies:{
                    "Internet":{
                        type:"radio", id:"Internet", label:"Internet (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Ausfall / Zuschaltung", label:"Ausfall / Zuschaltung"},
                            {id:"Unterbrechungen", label:"Unterbrechungen"},
                            {id:"Bandbreite", label:"Bandbreite"},
                        ]
                    },
                    "Telefonie":{
                        type:"radio", id:"Telefonie", label:"Telefonie (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Ausfall", label:"Ausfall"},
                            {id:"Eingehende Telefonie gestört", label:"Eingehende Telefonie gestört"},
                            {id:"Ausgehende Telefonie gestört", label:"Ausgehende Telefonie gestört"},
                        ]
                    },
                    "TV-COAX":{
                        type:"radio", id:"TV-COAX", label:"TV-COAX (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Ausfall", label:"Ausfall"},
                            {id:"Vereinzelte Sender fehlen", label:"Vereinzelte Sender fehlen"},
                            {id:"Bild- & Tonstörungen auf allen Sendern", label:"Bild- & Tonstörungen auf allen Sendern"},
                            {id:"Bild- & Tonstörungen auf einigen Sendern", label:"Bild- & Tonstörungen auf einigen Sendern"},
                            {id:"Endgerätesupport TV-COAX", label:"Endgerätesupport TV-COAX"},
                            {id:"Sonstiges", label:"Sonstiges"}
                        ]
                    },
                    "WAIPU-TV":{
                        type:"radio", id:"WAIPU-TV", label:"WAIPU-TV (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Aktivierungssupport", label:"Aktivierungssupport"},
                            {id:"Endgerätesupport WAIPU-TV", label:"Endgerätesupport WAIPU-TV"},
                            {id:"Sonstiges", label:"Sonstiges"}
                        ]
                    }
                },
            },
        ]
    },
    {
        id:"category_1_value_2",
        title:"Thema (Kartegorie 2)",
        description:"Thema (Kartegorie 2) Description",
        next:[
            { value:"any", next:"hs_form"}
        ],
        fields:[
            {
                id:"category_1_value_2_1", type:"radio", label:"Category 1 Value 2", required:true, value:"",
                isdepending:true,
                options:[
                    {id:"Internet", label:"Internet"},
                    {id:"Email", label:"Email"},
                    {id:"TV", label:"TV"},
                    {id:"Vertragsänderungen", label:"Vertragsänderungen"},
                    {id:"Hardware", label:"Hardware"},
                    {id:"Dokumente/Rechnungen", label:"Dokumente/Rechnungen"},
                    {id:"Intern", label:"Intern"}
                ],
            },
            {
                id:"category_1_value_2", type:"radio", label:"Anliegen (Kategorie 3)", required:true, value:"",
                depending:"category_1_value_2_1",
                dependencies:{
                    "Internet":{
                        type:"radio", id:"Internet", label:"Internet (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Ausfall / Zuschaltung", label:"Ausfall / Zuschaltung 2"},
                            {id:"Unterbrechungen", label:"Unterbrechungen 2"},
                            {id:"Bandbreite", label:"Bandbreite 2"},
                        ]
                    },
                    "Telefonie":{
                        type:"radio", id:"Telefonie", label:"Telefonie (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Ausfall", label:"Ausfall 2"},
                            {id:"Eingehende Telefonie gestört", label:"Eingehende Telefonie gestört 2"},
                            {id:"Ausgehende Telefonie gestört", label:"Ausgehende Telefonie gestört 2"},
                        ]
                    },
                    "TV-COAX":{
                        type:"radio", id:"TV-COAX", label:"TV-COAX (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Ausfall", label:"Ausfall 2"},
                            {id:"Vereinzelte Sender fehlen", label:"Vereinzelte Sender fehlen 2"},
                            {id:"Bild- & Tonstörungen auf allen Sendern", label:"Bild- & Tonstörungen auf allen Sendern 2"},
                            {id:"Bild- & Tonstörungen auf einigen Sendern", label:"Bild- & Tonstörungen auf einigen Sendern 2"},
                            {id:"Endgerätesupport TV-COAX", label:"Endgerätesupport TV-COAX 2"},
                            {id:"Sonstiges", label:"Sonstiges 2"}
                        ]
                    },
                    "WAIPU-TV":{
                        type:"radio", id:"WAIPU-TV", label:"WAIPU-TV (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Aktivierungssupport", label:"Aktivierungssupport 2"},
                            {id:"Endgerätesupport WAIPU-TV", label:"Endgerätesupport WAIPU-TV 2"},
                            {id:"Sonstiges", label:"Sonstiges 2"}
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
    },
    {
        id:"thank_you",
        title:"Thank You",
        description:"Thank You Description",
        fields:"thank_you",
        navigation:{
            next:false,
            prev:false
        }
    }
]

window.FORM_DATA = FORM_DATA;