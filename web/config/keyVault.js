'use strict';

const KeyVault = require('azure-keyvault');
const msRestAzure = require('ms-rest-azure');
const ContosoConfiguration = require('./ContosoConfiguration');

async function getSecret(keyVaultClient, vaultUri, secretName) {
    try
    {
        var secretVal = await keyVaultClient.getSecret(vaultUri, secretName, "");
        console.log("Loaded Secret: " + secretName);
        return secretVal.value;
    } catch (e) {
        console.log("Failed to load secret: " + secretName)
        console.error(e);
    }
}

exports.loadConfig = async function(keyVaultAccountName) {
    var credentials = null;
    if (!process.env.AZURE_CLIENT_ID){
        if (!process.env.APPSETTING_WEBSITE_SITE_NAME) {
            credentials = await msRestAzure.loginWithMSI({resource: 'https://vault.azure.net'});
        } else {
            credentials = await msRestAzure.loginWithAppServiceMSI({resource: 'https://vault.azure.net'});
        }
    } else {
        credentials = await msRestAzure.loginWithServicePrincipalSecret(process.env.AZURE_CLIENT_ID, process.env.AZURE_CLIENT_SECRET, process.env.AZURE_TENANT_ID);
    }

    var keyVaultClient = new KeyVault.KeyVaultClient(credentials);
    var vaultUri = "https://" + keyVaultAccountName + ".vault.azure.net/";

    let config = new ContosoConfiguration();

    config.azureRegion = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--AzureRegion");
    config.dataAccountName = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--DataAccountName");
    config.dataAccountUserName = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--DataAccountUserName");
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
    config.serviceConnectionString = await getSecret(keyVaultClient, vaultUri, "ContosoTravel--ServiceConnectionString");
    config.serviceFQDN =  await getSecret(keyVaultClient, vaultUri, "ContosoTravel--ServiceFQDN");
    return config;
}

