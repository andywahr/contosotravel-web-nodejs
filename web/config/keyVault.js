'use strict';

const KeyVault = require('azure-keyvault');
const msRestAzure = require('ms-rest-azure');
const ContosoConfiguration = require('./ContosoConfiguration');

async function getSecret(keyVaultClient, vaultUri, secretName) {
    var secretVal = await keyVaultClient.getSecret(vaultUri, secretName, "");
    console.log("Secret '" + secretName + "' = '" + secretVal.value + "'.");
    return secretVal.value;
}

exports.loadConfig = async function(keyVaultAccountName) {
   // var credentials = await msRestAzure.loginWithAppServiceMSI({resource: 'https://vault.azure.net'});
    var credentials = await msRestAzure.loginWithServicePrincipalSecret("9f46a7d6-3aa4-4612-a91f-24be65970ad8", "$.P=2*-:$)/#}{{#$/$;1%#![k_H(.[=(=#;^^+*}([$r!*.)$-=W/?{|_)", "microsoft.onmicrosoft.com");
    var keyVaultClient = new KeyVault.KeyVaultClient(credentials);
    var vaultUri = "https://" + keyVaultAccountName + ".vault.azure.net/";

    let config = new ContosoConfiguration();

    config.azureRegion = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--AzureRegion");
    config.dataAccountName = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--DataAccountName");
    config.dataAdministratorLogin = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--DataAdministratorLogin");
    config.dataAdministratorLoginPassword = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--DataAdministratorLoginPassword");
    config.dataAccountPassword = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--DataAccountPassword");
    config.databaseName = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--DatabaseName");
    config.dataType = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--DataType");
    config.resourceGroupName = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--ResourceGroupName");
    config.servicesMiddlewareAccountName = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--ServicesMiddlewareAccountName");
    config.servicesType = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--ServicesType");
    config.subscriptionId = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--SubscriptionId");
    config.tenantId = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--TenantId");

    return config;
}

