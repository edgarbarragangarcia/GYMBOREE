
export interface SiteContent {
    hero: {
        title: string;
        subtitle: string;
        description: string;
        imageUrl: string;
        ctaText: string;
    };
    styles: {
        titleColor: string;
        titleSize: string;
        subtitleColor: string;
        descColor: string;
        descSize: string;
        btnColor: string;
        btnTextColor: string;
    };
    settings: {
        forceSede: string; // ID de la sede para forzar (o vacío para auto-detectar)
    };
    contact: {
        defaultWhatsapp: string;
        defaultSedeName: string;
    };
    sedes: Sede[];
}

export interface Sede {
    id: string; // unique link text like 'cedritos'
    nombre: string;
    whatsapp: string;
    ciudad: string;
    lat: number;
    lon: number;
}

export const DEFAULT_CONTENT: SiteContent = {
    hero: {
        title: "Desarrollo Temprano,",
        subtitle: "Risas Infinitas",
        description: "Programas de juego y aprendizaje para niños de 0 a 5 años en Colombia",
        imageUrl: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=1600",
        ctaText: "Reserva una Clase"
    },
    styles: {
        titleColor: "#0f3e5d",
        titleSize: "4rem",
        subtitleColor: "#0f3e5d",
        descColor: "#4a5568",
        descSize: "1.25rem",
        btnColor: "#e85d04",
        btnTextColor: "#ffffff"
    },
    settings: {
        forceSede: "" // predeterminado: vacio (usa detección automática)
    },
    contact: {
        defaultWhatsapp: "573229474936",
        defaultSedeName: "Santa Bárbara"
    },
    sedes: [
        { id: "santa-barbara", nombre: "Santa Bárbara", whatsapp: "573229474936", ciudad: "Bogotá, Colombia", lat: 4.697, lon: -74.042 },
        { id: "cedritos", nombre: "Cedritos", whatsapp: "573202317530", ciudad: "Bogotá, Colombia", lat: 4.726, lon: -74.041 },
        { id: "chico", nombre: "Chicó", whatsapp: "573016173117", ciudad: "Bogotá, Colombia", lat: 4.678, lon: -74.048 },
        { id: "colina", nombre: "Colina", whatsapp: "573025118479", ciudad: "Bogotá, Colombia", lat: 4.733, lon: -74.068 },
        { id: "salitre", nombre: "Salitre", whatsapp: "573013220142", ciudad: "Bogotá, Colombia", lat: 4.646, lon: -74.114 },
        { id: "poblado", nombre: "Poblado", whatsapp: "573146208117", ciudad: "Medellín, Colombia", lat: 6.208, lon: -75.567 },
        { id: "laureles", nombre: "Laureles", whatsapp: "573203467137", ciudad: "Medellín, Colombia", lat: 6.242, lon: -75.594 },
        { id: "sabana", nombre: "Sede Sabana", whatsapp: "573146608696", ciudad: "Cajicá, Colombia", lat: 4.896, lon: -74.032 },
        { id: "bucaramanga", nombre: "Bucaramanga", whatsapp: "573208334585", ciudad: "Bucaramanga, Colombia", lat: 7.120, lon: -73.116 },
        { id: "ibague", nombre: "Ibagué", whatsapp: "573183422507", ciudad: "Ibagué, Colombia", lat: 4.438, lon: -75.212 }
    ]
};

class ContentStore {
    private static STORAGE_KEY = 'gymboree_cms_data';
    private data: SiteContent;
    private listeners: Function[] = [];

    constructor() {
        this.data = this.load();
    }

    private load(): SiteContent {
        const stored = localStorage.getItem(ContentStore.STORAGE_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_CONTENT;
    }

    get(): SiteContent {
        return this.data;
    }

    update(newData: Partial<SiteContent>) {
        this.data = { ...this.data, ...newData };
        this.save();
        this.notify();
    }

    updateHero(heroData: Partial<SiteContent['hero']>) {
        this.data.hero = { ...this.data.hero, ...heroData };
        this.save();
        this.notify();
    }

    updateStyles(styleData: Partial<SiteContent['styles']>) {
        this.data.styles = { ...this.data.styles, ...styleData };
        this.save();
        this.notify();
    }

    updateSettings(settingsData: Partial<SiteContent['settings']>) {
        this.data.settings = { ...this.data.settings, ...settingsData };
        this.save();
        this.notify();
    }

    save() {
        localStorage.setItem(ContentStore.STORAGE_KEY, JSON.stringify(this.data));
    }

    reset() {
        this.data = DEFAULT_CONTENT;
        this.save();
        this.notify();
    }

    subscribe(listener: Function) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(fn => fn(this.data));
    }
}

export const store = new ContentStore();
