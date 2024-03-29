// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    supabase: {
        supabaseUrl: 'https://igymrcuyhvviuxuujdzp.supabase.co',
        supabaseKey:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneW1yY3V5aHZ2aXV4dXVqZHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjA5NDc3MTksImV4cCI6MTk3NjUyMzcxOX0.sYpnvnJa3tredHnYhL1JzNzyfKjVY7u6L2PprBiPpE8'
    },
    firebase: {
        projectId: 'gpstracking-d1f5c',
        appId: '1:14386123808:web:f5f2a9cf191c897b789845',
        databaseURL: 'https://gpstracking-d1f5c-default-rtdb.firebaseio.com',
        storageBucket: 'gpstracking-d1f5c.appspot.com',
        locationId: 'us-west2',
        apiKey: 'AIzaSyBUq2hu2yLwaS7xNcscS7W3JRxVy1TerAw',
        authDomain: 'gpstracking-d1f5c.firebaseapp.com',
        messagingSenderId: '14386123808'
    },
    domains: {
        default: 'https://gpstracking-d1f5c.web.app',
        fallback: 'https://gpstracking-d1f5c.firebaseapp.com'
    },
    openstreetmap: {
        reverseGeocodingDomain: 'https://nominatim.openstreetmap.org/reverse'
    },
    apiKeys: {
        stadiaMaps: 'ab5a7aa3-15ae-49c0-87c5-2af1d7546486'
    },
    showDebug: true,
    environmentName: 'default'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
