$param
(
      [Parameter(Mandatory=$true)]
      $namePrefix
)

$sub=(az account show --query id --output tsv)
$url=(az keyvault secret show --vault-name "kv$namePrefix" --name "ContosoTravel--ServiceFQDN" --query value --output tsv)
$topicId=(az eventgrid topic list --resource-group "rg-$namePrefix" --subscription $sub --query [].id --output tsv)
az eventgrid event-subscription create --name ($namePrefix + "PurchaseItinerarySub") --source-resource-id $topicId --endpoint $url
