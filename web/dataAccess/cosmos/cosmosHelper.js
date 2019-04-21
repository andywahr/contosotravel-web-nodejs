const cosmos = require("@azure/cosmos");

class CosmosHelper {

  constructor(cosmosClient, cosmosConfig, containerId, indexes) {
    this.client = cosmosClient;
    this.databaseId = cosmosConfig.databaseName;
    this.collectionId = containerId;
    this.indexes = indexes;
    this.debug = function (msg) { console.log(msg); };

    this.database = null;
    this.container = null;
  }

  async init() {
    this.debug("Setting up the database...");
    const dbResponse = await this.client.databases.createIfNotExists({
      id: this.databaseId
    });
    this.database = dbResponse.database;
    this.debug("Setting up the database...done!");
    this.debug("Setting up the container...");
    var indexDefs = [
      {
        kind: cosmos.DocumentBase.IndexKind.Hash,
        dataType: cosmos.DocumentBase.DataType.String,
        precision: -1
      },
      {
        kind: cosmos.DocumentBase.IndexKind.Hash,
        dataType: cosmos.DocumentBase.DataType.Number,
        precision: -1
      }
    ];

    var includePaths = [];

    for (var ii = 0; ii < this.indexes.length; ii++) {
      var index = this.indexes[ii];
      includePaths.push({
        path: `/${index}/?`,
        indexes: indexDefs
      });
    }

    var indexPolicySpec = {
      includedPaths: includePaths,
      excludedPaths: [
        {
          path: "/*"
        }
      ],
      automatic : false
    };

    const coResponse = await this.database.containers.createIfNotExists({
      id: this.collectionId,
      indexingPolicy: indexPolicySpec
    });
    this.container = coResponse.container;
    this.debug("Setting up the container...done!");
  }

  async find(querySpec) {
    this.debug("Querying for items from the database");
    if (!this.container) {
      throw new Error("Collection is not initialized.");
    }
    var results = undefined;
    if (querySpec != undefined) {
      results = await this.container.items.query(querySpec).toArray();
    }
    else {
      results = await this.container.items.readAll().toArray();
    }
    return this.fixIds(results.result);
  }

  async findById(itemId) {
    this.debug("Getting an item from the database");
    try {
      const { body } = await this.container.item(itemId.toString()).read();
      return this.fixId(body);
    } catch (e) {
      if (e.code == 404) {
        return undefined;
      }
      throw e;
    }
  }

  async persist(doc) {
    const { body: replaced } = await this.container.items.upsert(doc);
    return replaced;
  }

  fixId(item) {
    if (item != undefined && item.Id == undefined) {
      item["Id"] = item.id;
    }
    return item;
  }

  fixIds(items) {
    if (items != undefined && items.length > 0) {
      for (var ii = 0; ii < items.length; ii++) {
        items[ii] = this.fixId(items[ii]);
      }
    }
    return items;
  }
}

module.exports = CosmosHelper;
