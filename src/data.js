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
            { value:"Technische Störungen", next:"step_3" , key:"category_1" },
            { value:"Allgemeine Anfragen / Vertragsänderungen", next:"step_4" , key:"category_1" }
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
        id:"step_3",
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
                    {id:"WAIPU-TV", label:"WAIPU-TV"}
                ],
            },
            {
                id:"category_1_value_1_1", type:"radio", label:"Anliegen (Kategorie 3)", required:true, value:"",
                depending:"category_1_value_1_field",
                dependencies:{
                    "Internet":{
                        type:"radio", id:"Internet", label:"Internet (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Ausfall / Zuschaltung", label:"Ausfall / Zuschaltung" , internal_value:"TS > Internet > Ausfall / Zuschaltung"},
                            {id:"Unterbrechungen", label:"Unterbrechungen" , internal_value:"TS > Internet > Unterbrechungen"},
                            {id:"Bandbreite", label:"Bandbreite" , internal_value:"TS > Internet > Bandbreite"},
                        ]
                    },
                    "Telefonie":{
                        type:"radio", id:"Telefonie", label:"Telefonie (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Ausfall", label:"Ausfall" , internal_value:"TS > Telefonie > Ausfall"},
                            {id:"Eingehende Telefonie gestört", label:"Eingehende Telefonie gestört" , internal_value:"TS > Telefonie > Eingehende Telefonie gestört"},
                            {id:"Ausgehende Telefonie gestört", label:"Ausgehende Telefonie gestört" , internal_value:"TS > Telefonie > Ausgehende Telefonie gestört"},
                        ]
                    },
                    "TV-COAX":{
                        type:"radio", id:"TV-COAX", label:"TV-COAX (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Ausfall", label:"Ausfall" , internal_value:"TS > TV-COAX > Ausfall"},
                            {id:"Vereinzelte Sender fehlen", label:"Vereinzelte Sender fehlen" , internal_value:"TS > TV-COAX > Vereinzelte Sender fehlen"},
                            {id:"Bild- & Tonstörungen auf allen Sendern", label:"Bild- & Tonstörungen auf allen Sendern" , internal_value:"TS > TV-COAX > Bild- & Tonstörungen auf allen Sendern"},
                            {id:"Endgerätesupport TV-COAX", label:"Endgerätesupport TV-COAX" , internal_value:"TS > TV-COAX > Endgerätesupport TV-COAX"},
                            {id:"Sonstiges", label:"Sonstiges" , internal_value:"TS > TV-COAX > Sonstiges"}
                        ]
                    },
                    "WAIPU-TV":{
                        type:"radio", id:"WAIPU-TV", label:"WAIPU-TV (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Aktivierungssupport", label:"Aktivierungssupport" , internal_value:"TS > WAIPU-TV > Aktivierungssupport"},
                            {id:"Endgerätesupport WAIPU-TV", label:"Endgerätesupport WAIPU-TV" , internal_value:"TS > WAIPU-TV > Endgerätesupport WAIPU-TV"},
                            {id:"Sonstiges", label:"Sonstiges" , internal_value:"TS > WAIPU-TV > Sonstiges"}
                        ]
                    }
                },
            },
        ]
    },
    {
        id:"step_4",
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
                    {id:"Vertragsänderungen", label:"Vertragsänderungen"}
                ],
            },
            {
                id:"category_1_value_2", type:"radio", label:"Anliegen (Kategorie 3)", required:true, value:"",
                depending:"category_1_value_2_1",
                dependencies:{
                    "Internet":{
                        type:"radio", id:"Internet", label:"Internet (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Ausfall / Zuschaltung", label:"Ausfall / Zuschaltung 2", internal_value:"EA > Internet > Ausfall / Zuschaltung"},
                            {id:"Unterbrechungen", label:"Unterbrechungen 2", internal_value:"EA > Internet > Unterbrechungen"},
                            {id:"Bandbreite", label:"Bandbreite 2", internal_value:"EA > Internet > Bandbreite"},
                        ]
                    },
                    "Email":{
                        type:"radio", id:"Email", label:"Email (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Ausfall", label:"Ausfall 2", internal_value:"EA > Email > Ausfall"},
                            {id:"Eingehende Telefonie gestört", label:"Eingehende Telefonie gestört 2", internal_value:"EA > Email > Eingehende Telefonie gestört"},
                            {id:"Ausgehende Telefonie gestört", label:"Ausgehende Telefonie gestört 2", internal_value:"EA > Email > Ausgehende Telefonie gestört"},
                        ]
                    },
                    "TV":{
                        type:"radio", id:"TV", label:"TV-COAX (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Ausfall", label:"Ausfall 2", internal_value:"EA > TV > Ausfall"},
                            {id:"Vereinzelte Sender fehlen", label:"Vereinzelte Sender fehlen 2", internal_value:"EA > TV > Vereinzelte Sender fehlen"},
                            {id:"Bild- & Tonstörungen auf allen Sendern", label:"Bild- & Tonstörungen auf allen Sendern 2", internal_value:"EA > TV > Bild- & Tonstörungen auf allen Sendern"},
                            {id:"Bild- & Tonstörungen auf einigen Sendern", label:"Bild- & Tonstörungen auf einigen Sendern 2", internal_value:"EA > TV > Bild- & Tonstörungen auf einigen Sendern"},
                            {id:"Endgerätesupport TV-COAX", label:"Endgerätesupport TV-COAX 2", internal_value:"EA > TV > Endgerätesupport TV-COAX"},
                            {id:"Sonstiges", label:"Sonstiges 2", internal_value:"EA > TV > Sonstiges"}
                        ]
                    },
                    "Vertragsänderungen":{
                        type:"radio", id:"WAIPU-TV", label:"WAIPU-TV (Kategorie 3)", required:true, value:"",
                        options:[
                            {id:"Aktivierungssupport", label:"Aktivierungssupport 2", internal_value:"EA > Vertragsänderungen > Aktivierungssupport"},
                            {id:"Endgerätesupport WAIPU-TV", label:"Endgerätesupport WAIPU-TV 2", internal_value:"EA > Vertragsänderungen > Endgerätesupport WAIPU-TV"},
                            {id:"Sonstiges", label:"Sonstiges 2", internal_value:"EA > Vertragsänderungen > Sonstiges"}
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