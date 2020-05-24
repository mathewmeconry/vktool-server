declare module 'passport-azure-ad-oauth2' {
    export default class AzureAdOAuth2Strategy {
        // Circular reference from index
        static Strategy: any
        constructor(options: any, verify: any)
        name: any
        resource: any
        authenticate(req: any, options: any): void
        authorizationParams(options: any): any
        parseErrorResponse(body: any, status: any): any
        tokenParams(options: any): any
        userProfile(accessToken: any, done: any): void
    }
}