import {DaptinClient} from 'daptin-client';

// const daptinClient = new DaptinClient(window.location.protocol + "//" + window.location.hostname, false, function () {
let endpoint = window.location.hostname === "site.daptin.com" ? "http://localhost:6336" : window.location.protocol + "//" + window.location.hostname + (window.location.port === "80" ? "" : window.location.port);

var daptinClient = new DaptinClient(endpoint, false, {
  getToken: function () {
    return localStorage.getItem("token");
  }
});

daptinClient.worldManager.init();

export function clearTableCache({commit}) {
  commit('clearTablesCache');
}

export function loadTables({commit}) {
  console.log("Load tables");
  daptinClient.worldManager.loadModels(true).then(function (worlds) {
    console.log("All models loaded", arguments);
    commit('setTables', worlds)
  }).catch(function (e) {
    console.log("Failed to connect to backend", e);
  })
}

export function setToken({commit}) {
  let token = localStorage.getItem("token");
  if (!token) {
    throw "Failed to login";
  }
  commit('setToken', token)
}

export function setSelectedTable({commit}, tableName) {
  commit("setSelectedTable", tableName)
}

export function getDefaultCloudStore({commit}) {
  console.log("Find default cloud store");
  daptinClient.jsonApi.findAll("cloud_store", {
    query: JSON.stringify([{
      "column": "name",
      "operator": "is",
      "value": "localstore"
    }])
  }).then(function (res) {
    console.log("Found cloud store", res);
    const cloudStore = res.data[0];
    commit("setDefaultCloudStore", cloudStore)
  }).catch(function (err) {
    console.log("Failed to find default cloud store", err)
  })
}

export function executeAction({commit}, params) {
  var tableName = params.tableName;
  var actionName = params.actionName;
  return daptinClient.actionManager.doAction(tableName, actionName, params.params);
}

export function deleteRow({commit}, row) {
  return daptinClient.jsonApi.destroy(row.tableName, row.reference_id)
}

export function createRow({commit}, row) {
  var tableName = row.tableName;
  delete row.tableName;
  return daptinClient.jsonApi.create(tableName, row)
}

export function updateRow({commit}, row) {
  var tableName = row.tableName;
  delete row.tableName;
  return daptinClient.jsonApi.update(tableName, row)
}

export function loadData({commit}, params) {
  var tableName = params.tableName;
  params = params.params;
  return daptinClient.jsonApi.findAll(tableName, params);
}

export function getTableSchema({commit}, tableName) {
  return new Promise(function (resolve, reject) {
    daptinClient.worldManager.loadModel(tableName, true).then(function () {
      resolve(daptinClient.worldManager.getColumnKeys(tableName, true));
    }).catch(reject)
  })
}

export function loadModel({commit}, tableName) {
  return daptinClient.worldManager.loadModel(tableName, true);
}

export function refreshTableSchema({commit}, tableName) {
  daptinClient.worldManager.loadModels(true).then(function (worlds) {
    console.log("All models loaded", arguments);
    commit('setTables', worlds)
  }).catch(function (e) {
    console.log("Failed to connect to backend", e);
  });
  return daptinClient.worldManager.refreshWorld(tableName, true);
}
