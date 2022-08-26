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
    firebase: {},
    showDebug: false,
    environmentName: 'notspecified'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
