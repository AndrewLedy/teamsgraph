  const msal = require('@azure/msal-node');

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
const msalConfig = {
    auth: {
        clientId: 'e2a3b3f9-7e41-4e25-8514-4a6ad51ba807',
        authority: 'https://login.microsoftonline.com/bec2a7a8-9358-4565-b1b5-6c6e0ba6da9b',
        knownAuthorities: ['https://login.microsoftonline.com/bec2a7a8-9358-4565-b1b5-6c6e0ba6da9b']
        //clientSecret: process.env.CLIENT_SECRET,
    }
};

/**
 * With client credentials flows permissions need to be granted in the portal by a tenant administrator.
 * The scope is always in the format '<resource>/.default'. For more, visit:
 * https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
 */
const tokenRequest = {
    scopes: ['https://graph.microsoft.com/.default'],
};

const uriConfig = {
    users: 'https://graph.microsoft.com/v1.0/users',
    presence: 'https://graph.microsoft.com/v1.0/users/{0}/presence',
    profile:'https://graph.microsoft.com/v1.0/users/{0}/photo/$value'
};



/**
 * Initialize a confidential client application. For more info, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/initialize-confidential-client-application.md
 */
const pca = new msal.PublicClientApplication(msalConfig);

const usernamePasswordRequest = {
    scopes: ["user.read"],
    username: "subashandrew@zb136.onmicrosoft.com", // Add your username here
    password: "aspire@123", // Add your password here
};

/**
 * Acquires token with client credentials.
 * @param {object} tokenRequest
 */
async function getToken(tokenRequest) {
    return (await pca.acquireTokenByUsernamePassword(usernamePasswordRequest)).accessToken;
}

module.exports = {
    uriConfig: uriConfig,
    tokenRequest: tokenRequest,
    getToken: getToken
};