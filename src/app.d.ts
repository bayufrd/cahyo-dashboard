/// <reference types="svelte" />
/// <reference types="vite/client" />
/// <reference types="@sveltejs/kit" />

declare module '$app/stores' {
    import type { Readable } from 'svelte/store';
    import type { Page, Navigation } from '@sveltejs/kit';
    
    export const page: Readable<Page>;
    export const navigating: Readable<Navigation | null>;
}

declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};