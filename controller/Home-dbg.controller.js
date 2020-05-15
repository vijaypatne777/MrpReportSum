sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/table/library",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/Sorter",
	"sap/m/Token",
	"sap/ui/model/type/String",
	"sap/ui/model/json/JSONModel",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/ui/core/util/Export",
	"sap/m/MessageBox",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/SearchField"
], function (Controller, MessageToast, library, DateFormat, Sorter, Token, typeString, JSONModel, ColumnListItem, Label, Export,
	ExportTypeCSV, MessageBox, SearchField) {
	"use strict";
	var SortOrder = library.SortOrder;
	var serviceuriUpdCondRe = "/OPENSAP/sap/opu/odata/sap/API_MRP_MATERIALS_SRV_01";
	var mat = {};
	var Data = {
		items: []
	};
	var oSelectedData = {
		MatList: []
	};
	var Data = {
		BotList: []
	};
	var objData = {
		oBotList: []
	};
	var matFlag;
	return Controller.extend("PP.mrpReport.controller.Home", {
		onInit: function () {
			var oView = this.getView();
			var oMultiInput1 = oView.byId("multiInput2");
			// add validator
			oMultiInput1.addValidator(function (args) {
				debugger;
				var text = args.text;
				return new Token({
					key: text,
					text: text
				});
			});

			// filterBar
			this.oFilterBar = null;
			var sViewId = this.getView().getId();

			this.oFilterBar = sap.ui.getCore().byId(sViewId + "--filterBar");

			this.oFilterBar.registerFetchData(this.fFetchData);
			this.oFilterBar.registerApplyData(this.fApplyData);
			this.oFilterBar.registerGetFiltersWithValues(this.fGetFiltersWithValues);

			this.fVariantStub();
			// this.onToggleSearchField();
			this.oFilterBar.fireInitialise();
			this._sHeader = this.oFilterBar.getHeader();
		},
		onSearchFbar: function () {
			debugger;
		},
		onClear: function (oEvent) {
			// this.tableDialog.close();
			var oItems = this.oFilterBar.getAllFilterItems(true);
			for (var i = 0; i < oItems.length; i++) {
				var oControl = this.oFilterBar.determineControlByFilterItem(oItems[i]);
				if (oControl) {
					oControl.setValue("");
				}
			}
		},
		onFiltersDialogClosed: function (oEvent) {
			this._showToast("filtersDialogClosed triggered");
		},

		fFetchData: function () {
			var oJsonParam;
			var oJsonData = [];
			var sGroupName;
			var oItems = this.getAllFilterItems(true);

			for (var i = 0; i < oItems.length; i++) {
				oJsonParam = {};
				sGroupName = null;
				if (oItems[i].getGroupName) {
					sGroupName = oItems[i].getGroupName();
					oJsonParam.groupName = sGroupName;
				}

				oJsonParam.name = oItems[i].getName();

				var oControl = this.determineControlByFilterItem(oItems[i]);
				if (oControl) {
					oJsonParam.value = oControl.getValue();
					oJsonData.push(oJsonParam);
				}
			}

			return oJsonData;
		},

		fApplyData: function (oJsonData) {

			var sGroupName;

			for (var i = 0; i < oJsonData.length; i++) {

				sGroupName = null;

				if (oJsonData[i].groupName) {
					sGroupName = oJsonData[i].groupName;
				}

				var oControl = this.determineControlByName(oJsonData[i].name, sGroupName);
				if (oControl) {
					oControl.setValue(oJsonData[i].value);
				}
			}
		},

		fGetFiltersWithValues: function () {
			var i;
			var oControl;
			var aFilters = this.getFilterGroupItems();

			var aFiltersWithValue = [];

			for (i = 0; i < aFilters.length; i++) {
				oControl = this.determineControlByFilterItem(aFilters[i]);
				if (oControl && oControl.getValue && oControl.getValue()) {
					aFiltersWithValue.push(aFilters[i]);
				}
			}

			return aFiltersWithValue;
		},

		fVariantStub: function () {
			var oVM = this.oFilterBar._oVariantManagement;
			oVM.initialise = function () {
				this.fireEvent("initialise");
				this._setStandardVariant();

				this._setSelectedVariant();
			};

			var nKey = 0;
			var mMap = {};
			var sCurrentVariantKey = null;
			oVM._oVariantSet = {

				getVariant: function (sKey) {
					return mMap[sKey];
				},
				addVariant: function (sName) {
					var sKey = "" + nKey++;

					var oVariant = {
						key: sKey,
						name: sName,
						getItemValue: function (s) {
							return this[s];
						},
						setItemValue: function (s, oObj) {
							this[s] = oObj;
						},
						getVariantKey: function () {
							return this.key;
						}
					};
					mMap[sKey] = oVariant;

					return oVariant;
				},

				setCurrentVariantKey: function (sKey) {
					sCurrentVariantKey = sKey;
				},

				getCurrentVariantKey: function () {
					return sCurrentVariantKey;
				},

				delVariant: function (sKey) {
					if (mMap[sKey]) {
						delete mMap[sKey];
					}
				}

			};
		},

		onSubmitInput: function (oEvent) {
				debugger;
			var text = oEvent.getParameters().value.toUpperCase();
			if (text !== "") {
				var oView = this.getView();
				var oMultiInput1 = oView.byId("multiInput2");
				var Data = {
					items: []
				};
				var serviceUrl = "/OPENSAP/sap/opu/odata/sap/API_MRP_MATERIALS_SRV_01";
				var oDateModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);
				var plant = this.getView().byId("idFieldPlant").getValue().toUpperCase();
				var mrpArea = this.getView().byId("idFieldMRPArea").getValue().toUpperCase();
				var h = [];
				h.push(new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, text));
				var xx = new sap.ui.model.Filter({
					filters: h,
					or: true,
					_bMultiFilter: false
				});
				var m = new sap.ui.model.Filter("MRPPlant", sap.ui.model.FilterOperator.EQ, plant);
				var d = new sap.ui.model.Filter({
					filters: [m],
					and: true
				});
				var a = new sap.ui.model.Filter("MRPArea", sap.ui.model.FilterOperator.EQ, mrpArea);
				var e = new sap.ui.model.Filter({
					filters: [a],
					and: true
				});
				var R = new Array(new sap.ui.model.Filter({
					filters: [d, e, xx],
					and: true
				}));
				oDateModel.read("/A_MRPMaterial", {
					async: false,
					filters: [R],
					success: function (data, response) {
						var value = data.results;
						var size = value.length;
						if (size !== 0) { //  No data Check in Table Search    
							for (var i = 0; i < size; i++) {
								Data.items.push({
									Material: value[i].Material,
									MaterialName: value[i].MaterialName
								});
							}
						} else {
							matFlag = null;
							Data = null;
							sap.m.MessageToast.show("No value found for material   " + text + ".Please delete.");
							text = null;
						}
					}
				});
			}
		},
		onDataExport: function (oEvent) {
			var dateModel = new sap.ui.model.json.JSONModel();
			dateModel.setData(Data.BotList);
			var oExport = new Export({
				exportType: new sap.ui.core.util.ExportTypeCSV({
					separatorChar: ",",
					charset: "utf-8"
				}),
				// Pass in the model created above
				models: dateModel,
				// binding information for the rows aggregation
				rows: {
					path: "/"
				},
				columns: [{
					name: "Material",
					template: {
						content: "{Material}"
					}
				}, {
					name: "MRPPlant",
					template: {
						content: "{MRPPlant}"
					}
				}, {
					name: "MRPArea",
					template: {
						content: "{MRPArea}"
					}
				}, {
					name: "MaterialName",
					template: {
						content: "{MaterialName}"
					}
				}, {
					name: "Supplier",
					template: {
						content: "{MRPElementBusinessPartner}"
					}
				},
				{
					name: "End Date",
					template: {
						content: "{MRPElementAvailyOrRqmtDate}"
					}
				}, {
					name: "Availablity",
					template: {
						content: "{MRPAvailableQuantity}"
					}
				}, {
					name: "Availablity Date",
					template: {
						content: "{MRPAvailableQuantityDate}"
					}
				}, {
					name: "SafetyStk",
					template: {
						content: "{SafetyStk}"
					}
				}, {
					name: "Stock",
					template: {
						content: "{Stock}"
					}
				}, {
					name: "AvailableStock",
					template: {
						content: "{AvailableStock}"
					}
				}, {
					name: "DependReq",
					template: {
						content: "{DependReq}"
					}
				}, {
					name: "PurchReq",
					template: {
						content: "{PurchReq}"
					}
				}, {
					name: "DependReq",
					template: {
						content: "{DependReq}"
					}
				}, {
					name: "Plndorder",
					template: {
						content: "{Plndorder}"
					}
				}, {
					name: "IndReqmt",
					template: {
						content: "{IndReqmt}"
					}
				}, {
					name: "Order",
					template: {
						content: "{Order}"
					}
				}, {
					name: "ProdOrder",
					template: {
						content: "{ProdOrder}"
					}
				}, {
					name: "Delivery",
					template: {
						content: "{Delivery}"
					}
				}, {
					name: "POitem",
					template: {
						content: "{POitem}"
					}
				}, {
					name: "OrderRes",
					template: {
						content: "{OrderRes}"
					}
				}, {
					name: "RetrnsItem",
					template: {
						content: "{RetrnsItem}"
					}
				}]
			});

			oExport.saveFile().always(function () {
				this.destroy();
			});
		},
		onHelpTable: function (e) {
		debugger;
			sap.m.MessageToast.show("Please wait !!! fetching list of Material for you ");
			var plant = this.getView().byId("idFieldPlant").getValue().toUpperCase();
			var mrpArea = this.getView().byId("idFieldMRPArea").getValue().toUpperCase();
			if (plant !== "" || mrpArea !== "") {
				var Data = {
					items: []
				};
				if (!this.tableDialog) {
					this.tableDialog = sap.ui.xmlfragment(
						"PP.mrpReport.fragments.ValueHelpPopup", this);
					this.getView().addDependent(this.tableDialog);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", this
						.getView(), this.tableDialog);
				}
				this.tableDialog.open();
				var tDialog = sap.ui.getCore().byId("botTabDialog");
				tDialog.getColumns()[1].setProperty("visible", true);
				var dateModel = new sap.ui.model.json.JSONModel();
				dateModel.setData(Data);
				var serviceUrl = "/OPENSAP/sap/opu/odata/sap/API_MRP_MATERIALS_SRV_01";
				var oDateModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);
				var entitySet = "A_MRPMaterial";
				debugger;
				var mrpControl = this.getView().byId("idMRPControl").getValue().toUpperCase();
				this.tableDialog.setBusy(true);
				if (mrpControl === "") {
					var searchUri =
						"/A_MRPMaterial?$orderby=Material&$select=Material,MaterialName&$filter=( MRPPlant eq '" + plant + "' and MRPArea eq '" +
						mrpArea +
						"')";
				}
				if (mrpControl !== "") {
					var searchUri =
						"/A_MRPMaterial?$orderby=Material&$select=Material,MaterialName,MRPController&$filter=( MRPPlant eq '" + plant +
						"' and MRPArea eq '" + mrpArea + "' and MRPController eq '" + mrpControl +
						"')";
				}
				oDateModel.read(searchUri, {
					success: function (data, response) {
						var value = data.results;
						var size = value.length;
						if (size !== 0) { //  No data Check in Table Search    
							for (var i = 0; i < size; i++) {
								Data.items.push({
									Material: value[i].Material,
									MaterialName: value[i].MaterialName,
									MRPController: value[i].MRPController
								});
							}
						} else {
							Data = null;
							sap.m.MessageToast.show("The Search Criteria fetched no result. Please enter valid values");
						}
						dateModel.setData(Data);
						objData = Data;
						tDialog.setModel(dateModel, "botTabModel3");
						tDialog.setVisible(true);
					}
				});
			} else {
				sap.m.MessageToast.show("Please provide MRP Area and Plant");
			}
			this.tableDialog.setBusy(false);
		},
		onConfirm: function (oEvent) {
			var oSelectedData = {
				MatList: []
			};
			var table1 = sap.ui.getCore().byId("botTabDialog");
			var oPopupModel = table1.getModel("botTabModel3");
			var selectedItems = table1.getSelectedItems();
			var size = selectedItems.length;
			var oView = this.getView();
			var oMultiInput1 = oView.byId("multiInput2");
			for (var i = 0; i < size; i++) {
				var sPath = table1.getSelectedItems()[i].oBindingContexts.botTabModel3.sPath;
				var oIndex = table1.getSelectedItems()[i].oBindingContexts.botTabModel3.sPath.slice(7, 15);
				var takenMaterial = oPopupModel.oData.items[oIndex].Material;
				var takenMaterialName = oPopupModel.oData.items[oIndex].MaterialName;
				oMultiInput1.addToken(new sap.m.Token({
					key: takenMaterial,
					text: takenMaterial
				}));
				oSelectedData.MatList.push({
					Material: takenMaterial,
					MaterialName: takenMaterialName
				});
			}
			this.tableDialog.close();
		},
		onCancel: function () {
			this.tableDialog.close();
		},
		onSuggestLive: function (event) {
				debugger;
			var Data = {
				items: []
			};
			var serviceUrl = "/OPENSAP/sap/opu/odata/sap/API_MRP_MATERIALS_SRV_01";
			var oDateModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);
			var entitySet = "A_MRPMaterial";
			var oView = this.getView();
			var oMultiInput1 = event.mParameters.suggestValue;
			var plant = this.getView().byId("idFieldPlant").getValue().toUpperCase();
			var mrpArea = this.getView().byId("idFieldMRPArea").getValue().toUpperCase();
			var h = [];
			h.push(new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, event.mParameters.suggestValue.toUpperCase()));
			var xx = new sap.ui.model.Filter({
				filters: h,
				or: true,
				_bMultiFilter: false
			});
			var m = new sap.ui.model.Filter("MRPPlant", sap.ui.model.FilterOperator.EQ, plant);
			var d = new sap.ui.model.Filter({
				filters: [m],
				and: true
			});
			var a = new sap.ui.model.Filter("MRPArea", sap.ui.model.FilterOperator.EQ, mrpArea);
			var e = new sap.ui.model.Filter({
				filters: [a],
				and: true
			});
			var R = new Array(new sap.ui.model.Filter({
				filters: [d, e, xx],
				and: true
			}));

			oDateModel.read("/A_MRPMaterial", {
				async: false,
				filters: [R],
				success: function (data, response) {
					var value = data.results;
					var size = value.length;
					if (size !== 0) { //  No data Check in Table Search    
						for (var i = 0; i < size; i++) {
							Data.items.push({
								Material: value[i].Material,
								MaterialName: value[i].MaterialName
							});
						}
					} else {
						Data = null;
						sap.m.MessageToast.show("The Search Criteria fetched no result. Please enter valid values");
					}
				}
			});

			var afterSuggest = event.getParameter("suggestValue");
			var botModelSuggest = new sap.ui.model.json.JSONModel();
			var oView = this.getView();
			var oMultiInput1 = oView.byId("multiInput2");
			var mValue = oMultiInput1.getValue();
			oMultiInput1.setValue = "";
			botModelSuggest.setData(Data);
			for (var dName = 0; dName < Data.items.length; dName++) {
				oMultiInput1.addToken(new sap.m.Token({
					key: Data.items[dName].Material,
					text: Data.items[dName].Material
				}));
			}

			oView.setModel(botModelSuggest, "botModelSugg");
			this.oSF = sap.ui.getCore().byId("searchField");
			this.oSF.suggest();
		},
		_validateMaterial: function () {
				debugger;
			var mrpControl = this.getView().byId("idMRPControl").getValue().toUpperCase();
			var plant = this.getView().byId("idFieldPlant").getValue().toUpperCase();
			var mrpArea = this.getView().byId("idFieldMRPArea").getValue().toUpperCase();
			var oView = this.getView();
			var oMultiInputSel = oView.byId("multiInput2");
			var oTokens = oMultiInputSel.getTokens();
			var Data = {
				items: []
			};
			var serviceUrl = "/OPENSAP/sap/opu/odata/sap/API_MRP_MATERIALS_SRV_01";
			var oDateModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);
			var h = [];
			for (var v = 0; v < oTokens.length; v++) {
				h.push(new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, oTokens[v].mProperties.key.toUpperCase()));
			}
			var xx = new sap.ui.model.Filter({
				filters: h,
				or: true,
				_bMultiFilter: false
			});
			var m = new sap.ui.model.Filter("MRPPlant", sap.ui.model.FilterOperator.EQ, plant);
			var d = new sap.ui.model.Filter({
				filters: [m],
				and: true
			});
			var a = new sap.ui.model.Filter("MRPArea", sap.ui.model.FilterOperator.EQ, mrpArea);
			var e = new sap.ui.model.Filter({
				filters: [a],
				and: true
			});
			var R = new Array(new sap.ui.model.Filter({
				filters: [d, e, xx],
				and: true
			}));
			oDateModel.read("/A_MRPMaterial", {
				async: false,
				filters: [R],
				success: function (data, response) {
					var value = data.results;
					var size = value.length;
					if (size !== 0) { //  No data Check in Table Search    
						for (var i = 0; i < size; i++) {
							Data.items.push({
								Material: value[i].Material,
								MaterialName: value[i].MaterialName
							});
						}
					}
				}
			});
			return Data.items;
		},
		onSearch: function (oEvent) {
				debugger;
			var mrpControl = this.getView().byId("idMRPControl").getValue().toUpperCase();
			var plant = this.getView().byId("idFieldPlant").getValue().toUpperCase();
			var mrpArea = this.getView().byId("idFieldMRPArea").getValue().toUpperCase();
			var oView = this.getView();
			var oMultiInputSel = oView.byId("multiInput2");
			var oTokens = oMultiInputSel.getTokens();

			// Pick materials Name
			var oMaterialName = {
				items: []
			};
			oMaterialName.items = this._validateMaterial();

			//Pick SupplyDemandItems
			if (plant !== "" || mrpArea !== "" || oTokens.length > 0) {
				var h = [];
				for (var v = 0; v < oTokens.length; v++) {
					h.push(new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, oMultiInputSel.getTokens()[v].mProperties.key.toUpperCase()));
				}
				var xx = new sap.ui.model.Filter({
					filters: h,
					or: true,
					_bMultiFilter: false
				});
				var m = new sap.ui.model.Filter("MRPPlant", sap.ui.model.FilterOperator.EQ, plant);
				var d = new sap.ui.model.Filter({
					filters: [m],
					and: true
				});
				var a = new sap.ui.model.Filter("MRPArea", sap.ui.model.FilterOperator.EQ, mrpArea);
				var e = new sap.ui.model.Filter({
					filters: [a],
					and: true
				});
				var R = new Array(new sap.ui.model.Filter({
					filters: [d, e, xx],
					and: true
				}));
				debugger;
				if (mrpControl !== "") {
					var omrpControl = new sap.ui.model.Filter("MRPController", sap.ui.model.FilterOperator.EQ, mrpControl);
					var amrpControl = new sap.ui.model.Filter({
						filters: [omrpControl],
						and: true
					});
					var R = new Array(new sap.ui.model.Filter({
						filters: [d, e, xx, amrpControl],
						and: true
					}));
				}
				var serviceuriUpdCondRe = "/OPENSAP/sap/opu/odata/sap/API_MRP_MATERIALS_SRV_01";
				var oSupplierSet = "/SupplyDemandItems";
				var materialModel = new sap.ui.model.odata.ODataModel(serviceuriUpdCondRe, true);
				materialModel.setHeaders({
					"Content-Type": "application/json",
					"Accept": "application/json",
					"APIKey": "jQdx3TI7jIFCKaxK3GR4r5dYqF8heA4q"
				});
				var oMaterialSftyStock = {};
				var aMaterialSftyStock = [];
				var oMaterialStockIt = {};
				var aMaterialStockIt = [];
				materialModel.read(oSupplierSet, {
					async: false,
					filters: [R],
					success: function (data, response) {
						var valueSupplierSet = data.results;
						var size = valueSupplierSet.length;
						var countActualRecord = 0;
						debugger;
						var flag;
						for (var i = 0; i < size; i++) {
							countActualRecord++;

															// //Pick positive entry from fast
								if (valueSupplierSet[i].MRPAvailableQuantity > 0 &&
									valueSupplierSet[i].MRPElementCategoryShortName !== "SafetyStk" &&
									flag !== "true") {
									oMaterialSftyStock.MRPAvailableQuantity = parseFloat(valueSupplierSet[i].MRPAvailableQuantity);
									oMaterialSftyStock.MRPAvailableQuantityDate = valueSupplierSet[i].MRPElementAvailyOrRqmtDate.toISOString();
									// oMaterialSftyStock.MRPAvailableQuantityFaPos = parseFloat(valueSupplierSet[i].MRPAvailableQuantity);
									// oMaterialSftyStock.MRPAvailableQuantityDateFaPos = valueSupplierSet[i].MRPElementAvailyOrRqmtDate.toISOString();
									flag = "true";
								}

							//Calculate fixed values - SafetyStk
							// add current record because this is last record inside loop
							if (countActualRecord === size) {
								if (valueSupplierSet[i].MRPElementCategoryShortName === "SafetyStk") {
									// Last record so push
									var SafetyStk = parseFloat(valueSupplierSet[i].MRPElementOpenQuantity);
									oMaterialSftyStock.Material = valueSupplierSet[i].Material;
									oMaterialSftyStock.SafetyStk = parseFloat(oMaterialSftyStock.SafetyStk) + SafetyStk;

									if (oMaterialSftyStock.SafetyStk === undefined) {
										oMaterialSftyStock.SafetyStk = 0;
									}
									if (oMaterialSftyStock.SafetyStk !== 0) {
										oMaterialSftyStock.SafetyStk *= -1;
									}
									aMaterialSftyStock.push(oMaterialSftyStock);
											flag = "false";
									SafetyStk = 0;
									oMaterialSftyStock = {};
								} else {

									oMaterialSftyStock.Material = valueSupplierSet[i].Material;
									oMaterialSftyStock.SafetyStk = SafetyStk;
									if (oMaterialSftyStock.SafetyStk === undefined) {
										oMaterialSftyStock.SafetyStk = 0;
									}
									if (oMaterialSftyStock.SafetyStk !== 0) {
										oMaterialSftyStock.SafetyStk *= -1;
									}
									aMaterialSftyStock.push(oMaterialSftyStock);
											flag = "false";
									SafetyStk = 0;
									oMaterialSftyStock = {};
								}
							} else {
								// check material number and add if next material number is different(this will add upto second last record only)
								if (valueSupplierSet[i].Material === valueSupplierSet[i + 1].Material) {
									// Same material dont push
									if (valueSupplierSet[i].MRPElementCategoryShortName === "SafetyStk") {
										// Last record so push
										var SafetyStk = parseFloat(valueSupplierSet[i].MRPElementOpenQuantity);
										oMaterialSftyStock.Material = valueSupplierSet[i].Material;
										oMaterialSftyStock.SafetyStk = parseFloat(oMaterialSftyStock.SafetyStk) + SafetyStk;
									}
								} else {
									// Next one is different material so push push
									if (valueSupplierSet[i].MRPElementCategoryShortName === "SafetyStk") {
										// Last record so push
										var SafetyStk = parseFloat(valueSupplierSet[i].MRPElementOpenQuantity);
										oMaterialSftyStock.Material = valueSupplierSet[i].Material;
										oMaterialSftyStock.SafetyStk = parseFloat(oMaterialSftyStock.SafetyStk) + SafetyStk;

										if (oMaterialSftyStock.SafetyStk === undefined) {
											oMaterialSftyStock.SafetyStk = 0;
										}
										if (oMaterialSftyStock.SafetyStk !== 0) {
											oMaterialSftyStock.SafetyStk *= -1;
										}
										aMaterialSftyStock.push(oMaterialSftyStock);
												flag = "false";
										SafetyStk = 0;
										oMaterialSftyStock = {};
									} else {
										oMaterialSftyStock.Material = valueSupplierSet[i].Material;
										oMaterialSftyStock.SafetyStk = SafetyStk;

										if (oMaterialSftyStock.SafetyStk === undefined) {
											oMaterialSftyStock.SafetyStk = 0;
										}
										if (oMaterialSftyStock.SafetyStk !== 0) {
											oMaterialSftyStock.SafetyStk *= -1;
										}
										aMaterialSftyStock.push(oMaterialSftyStock);
												flag = "false";
										SafetyStk = 0;
										oMaterialSftyStock = {};
									}
								}
							}
							// Pick all records
							oMaterialStockIt.Material = valueSupplierSet[i].Material;
							oMaterialStockIt.MRPPlant = valueSupplierSet[i].MRPPlant;
							oMaterialStockIt.MRPArea = valueSupplierSet[i].MRPArea;
							oMaterialStockIt.MRPController = valueSupplierSet[i].MRPController;
							oMaterialStockIt.MRPElementCategoryShortName = valueSupplierSet[i].MRPElementCategoryShortName;
							oMaterialStockIt.MRPElementOpenQuantity = valueSupplierSet[i].MRPElementOpenQuantity;
							oMaterialStockIt.MRPElementAvailyOrRqmtDate = new Date(valueSupplierSet[i].MRPElementAvailyOrRqmtDate);
							oMaterialStockIt.MaterialBaseUnit = valueSupplierSet[i].MaterialBaseUnit;
							oMaterialStockIt.MRPElementBusinessPartner = valueSupplierSet[i].MRPElementBusinessPartner;
							aMaterialStockIt.push(oMaterialStockIt);
							oMaterialStockIt = {};
						}
					}
				});
				//<- aMaterialSftyStock
				//<- aMaterialStockIt
				//<- oMaterialName.items
				//Out-> filterData
				// Filter data based on Date range selected by user
				var OdataBatchHdr = {};
				var filterData = [];
				var size = aMaterialStockIt.length;
				// var oDateRange = this.getView().byId("idDRS3");
				// if (oDateRange.getValue() !== "") {
				// 	for (var i = 0; i < size; i++) {
				// 		if (aMaterialStockIt[i].MRPElementAvailyOrRqmtDate.toISOString() >= oDateRange.getFrom().toISOString() &&
				// 			aMaterialStockIt[i].MRPElementAvailyOrRqmtDate.toISOString() <= oDateRange.getTo().toISOString()
				// 		) {
				// 			//Fill material name
				// 			for (var k = 0; k < oMaterialName.items.length; k++) {
				// 				if (aMaterialStockIt[i].Material === oMaterialName.items[k].Material) {
				// 					OdataBatchHdr.MaterialName = oMaterialName.items[k].MaterialName;
				// 					break;
				// 				}
				// 			}
				// 			//Fill MaterialSftyStock
				// 			for (var j = 0; j < aMaterialSftyStock.length; j++) {
				// 				if (aMaterialStockIt[i].Material === aMaterialSftyStock[j].Material) {
				// 					OdataBatchHdr.SafetyStk = aMaterialSftyStock[j].SafetyStk;
				// 					OdataBatchHdr.MRPAvailableQuantity = aMaterialSftyStock[j].MRPAvailableQuantity;
				// 					OdataBatchHdr.MRPAvailableQuantityDate = aMaterialSftyStock[j].MRPAvailableQuantityDate;
				// 					break;
				// 				}
				// 			}
				// 			//Fill other fields
				// 			OdataBatchHdr.Material = aMaterialStockIt[i].Material;
				// 			OdataBatchHdr.MRPPlant = aMaterialStockIt[i].MRPPlant;
				// 			OdataBatchHdr.MRPArea = aMaterialStockIt[i].MRPArea;
				// 			OdataBatchHdr.MRPController = aMaterialStockIt[i].MRPController;
				// 			OdataBatchHdr.MaterialBaseUnit = aMaterialStockIt[i].MaterialBaseUnit;
				// 			OdataBatchHdr.MRPElementAvailyOrRqmtDate = aMaterialStockIt[i].MRPElementAvailyOrRqmtDate;
				// 			OdataBatchHdr.MRPElementCategoryShortName = aMaterialStockIt[i].MRPElementCategoryShortName;
				// 			OdataBatchHdr.MRPElementOpenQuantity = aMaterialStockIt[i].MRPElementOpenQuantity;
				// 			OdataBatchHdr.MRPElementBusinessPartner = aMaterialStockIt[i].MRPElementBusinessPartner;
				// 			filterData.push(OdataBatchHdr);
				// 			OdataBatchHdr = {};
				// 		}
				// 	}
				// } 
				// else {
					for (var i = 0; i < size; i++) {
						//Fill material name
						for (var k = 0; k < oMaterialName.items.length; k++) {
							if (aMaterialStockIt[i].Material === oMaterialName.items[k].Material) {
								OdataBatchHdr.MaterialName = oMaterialName.items[k].MaterialName;
								break;
							}
						}
						//Fill MaterialSftyStock
						for (var j = 0; j < aMaterialSftyStock.length; j++) {
							if (aMaterialStockIt[i].Material === aMaterialSftyStock[j].Material) {
								OdataBatchHdr.SafetyStk = aMaterialSftyStock[j].SafetyStk;
								OdataBatchHdr.MRPAvailableQuantity = aMaterialSftyStock[j].MRPAvailableQuantity;
								OdataBatchHdr.MRPAvailableQuantityDate = aMaterialSftyStock[j].MRPAvailableQuantityDate;
								break;
							}
						}

						//Fill other fields
						OdataBatchHdr.Material = aMaterialStockIt[i].Material;
						OdataBatchHdr.MRPPlant = aMaterialStockIt[i].MRPPlant;
						OdataBatchHdr.MRPArea = aMaterialStockIt[i].MRPArea;
						OdataBatchHdr.MRPController = aMaterialStockIt[i].MRPController;
						OdataBatchHdr.MaterialBaseUnit = aMaterialStockIt[i].MaterialBaseUnit;
						OdataBatchHdr.MRPElementAvailyOrRqmtDate = aMaterialStockIt[i].MRPElementAvailyOrRqmtDate;
						OdataBatchHdr.MRPElementCategoryShortName = aMaterialStockIt[i].MRPElementCategoryShortName;
						OdataBatchHdr.MRPElementOpenQuantity = aMaterialStockIt[i].MRPElementOpenQuantity;
						OdataBatchHdr.MRPElementBusinessPartner = aMaterialStockIt[i].MRPElementBusinessPartner;
						filterData.push(OdataBatchHdr);
						OdataBatchHdr = {};
					}
				// }
				// Cumulate all filtered data into final table to display
				//->filterData
				var value = [];
				value = filterData;
				var count = 0;
				var OdataBatchHdr = {};
				var OdataBatchCub = [];
				OdataBatchHdr.Stock = 0;
				OdataBatchHdr.SafetyStk = 0;
				OdataBatchHdr.AvailableStock = 0;
				OdataBatchHdr.DependReq = 0;
				OdataBatchHdr.PurchReq = 0;
				for (var i = 0; i < value.length; i++) {
					count++;
					if (count === value.length) {
						var lastRecordInd = "X";
						var MRPElementCategoryShortName = value[i].MRPElementCategoryShortName;
						var headerRow = MRPElementCategoryShortName.trim();
						switch (headerRow) {
						case "Stock":
							if (OdataBatchHdr.Stock === undefined) {
								OdataBatchHdr.Stock = parseFloat(value[i].MRPElementOpenQuantity);
							} else {
								OdataBatchHdr.Stock = parseFloat(OdataBatchHdr.Stock) + parseFloat(value[i].MRPElementOpenQuantity);
							}
							break;
						case "DependReq":
							if (OdataBatchHdr.DependReq === undefined) {
								OdataBatchHdr.DependReq = parseFloat(value[i].MRPElementOpenQuantity);
							} else {
								OdataBatchHdr.DependReq = parseFloat(OdataBatchHdr.DependReq) + parseFloat(value[i].MRPElementOpenQuantity);
							}
							break;
						case "PurchReq":
							if (OdataBatchHdr.PurchReq === undefined) {
								OdataBatchHdr.PurchReq = parseFloat(value[i].MRPElementOpenQuantity);
							} else {
								OdataBatchHdr.PurchReq = parseFloat(OdataBatchHdr.PurchReq) + parseFloat(value[i].MRPElementOpenQuantity);
							}
							break;
						case "Plnd order":
							if (OdataBatchHdr.Plndorder === undefined) {
								OdataBatchHdr.Plndorder = parseFloat(value[i].MRPElementOpenQuantity);
							} else {
								OdataBatchHdr.Plndorder = parseFloat(OdataBatchHdr.Plndorder) + parseFloat(value[i].MRPElementOpenQuantity);
							}
							break;
						case "IndReqmt":
							if (OdataBatchHdr.IndReqmt === undefined) {
								OdataBatchHdr.IndReqmt = parseFloat(value[i].MRPElementOpenQuantity);
							} else {
								OdataBatchHdr.IndReqmt = parseFloat(OdataBatchHdr.IndReqmt) + parseFloat(value[i].MRPElementOpenQuantity);
							}
							break;
						case "Order":
							if (OdataBatchHdr.Order === undefined) {
								OdataBatchHdr.Order = parseFloat(value[i].MRPElementOpenQuantity);
							} else {
								OdataBatchHdr.Order = parseFloat(OdataBatchHdr.Order) + parseFloat(value[i].MRPElementOpenQuantity);
							}
							break;
						case "ProdOrder":
							if (OdataBatchHdr.ProdOrder === undefined) {
								OdataBatchHdr.ProdOrder = parseFloat(value[i].MRPElementOpenQuantity);
							} else {
								OdataBatchHdr.ProdOrder = parseFloat(OdataBatchHdr.ProdOrder) + parseFloat(value[i].MRPElementOpenQuantity);
							}
							break;
						case "Delivery":
							if (OdataBatchHdr.Delivery === undefined) {
								OdataBatchHdr.Delivery = parseFloat(value[i].MRPElementOpenQuantity);
							} else {
								OdataBatchHdr.Delivery = parseFloat(OdataBatchHdr.Delivery) + parseFloat(value[i].MRPElementOpenQuantity);
							}
							break;
						case "PO item":
							if (OdataBatchHdr.POitem === undefined) {
								OdataBatchHdr.POitem = parseFloat(value[i].MRPElementOpenQuantity);
							} else {
								OdataBatchHdr.POitem = parseFloat(OdataBatchHdr.POitem) + parseFloat(value[i].MRPElementOpenQuantity);
							}
							OdataBatchHdr.MRPElementBusinessPartner = value[i].MRPElementBusinessPartner;
							break;
						case "OrderRes":
							if (OdataBatchHdr.OrderRes === undefined) {
								OdataBatchHdr.OrderRes = parseFloat(value[i].MRPElementOpenQuantity);
							} else {
								OdataBatchHdr.OrderRes = parseFloat(OdataBatchHdr.OrderRes) + parseFloat(value[i].MRPElementOpenQuantity);
							}
							break;
						case "RetrnsItem":
							if (OdataBatchHdr.RetrnsItem === undefined) {
								OdataBatchHdr.RetrnsItem = parseFloat(value[i].MRPElementOpenQuantity);
							} else {
								OdataBatchHdr.RetrnsItem = parseFloat(OdataBatchHdr.RetrnsItem) + parseFloat(value[i].MRPElementOpenQuantity);
							}
							break;
						}
						OdataBatchHdr.SafetyStk = parseFloat(value[i].SafetyStk);
						OdataBatchHdr.AvailableStock = parseFloat(OdataBatchHdr.Stock) - parseFloat(OdataBatchHdr.SafetyStk);
						if (OdataBatchHdr.AvailableStock === undefined || OdataBatchHdr.AvailableStock === 'NaN') {
							OdataBatchHdr.AvailableStock = 0;
						}
						if (OdataBatchHdr.AvailableStock < 0) {
							OdataBatchHdr.status = "Warning";
						}
						//Modify MRPElementAvailyOrRqmtDate
						var startDate = new Date(value[i].MRPElementAvailyOrRqmtDate);
						var newStart = startDate.toISOString();
						OdataBatchHdr.MRPElementAvailyOrRqmtDate = newStart.substr(0, 10);
						// Add other fields
						OdataBatchHdr.Material = value[i].Material;
						OdataBatchHdr.MRPPlant = value[i].MRPPlant;
						OdataBatchHdr.MRPArea = value[i].MRPArea;
						OdataBatchHdr.MRPController = value[i].MRPController;
						OdataBatchHdr.MRPAvailableQuantity = value[i].MRPAvailableQuantity;
						if (value[i].MRPAvailableQuantityDate !== undefined) {
							OdataBatchHdr.MRPAvailableQuantityDate = value[i].MRPAvailableQuantityDate.substr(0, 10);
						}
						OdataBatchHdr.MaterialBaseUnit = value[i].MaterialBaseUnit;
						OdataBatchHdr.MRPElementOpenQuantity = value[i].MRPElementOpenQuantity;
						OdataBatchHdr.MaterialName = value[i].MaterialName;
						OdataBatchCub.push(OdataBatchHdr);
						OdataBatchHdr = {};
					} else {
						// Cemulate all qty for same material#
						if (value[i].Material === value[i + 1].Material) {
							MRPElementCategoryShortName = value[i].MRPElementCategoryShortName;
							headerRow = MRPElementCategoryShortName.trim();
							switch (headerRow) {
							case "Stock":
								if (OdataBatchHdr.Stock === undefined) {
									OdataBatchHdr.Stock = parseFloat(value[i].MRPElementOpenQuantity);
								} else {
									OdataBatchHdr.Stock = parseFloat(OdataBatchHdr.Stock) + parseFloat(value[i].MRPElementOpenQuantity);
								}
								break;
							case "DependReq":
								if (OdataBatchHdr.DependReq === undefined) {
									OdataBatchHdr.DependReq = parseFloat(value[i].MRPElementOpenQuantity);
								} else {
									OdataBatchHdr.DependReq = parseFloat(OdataBatchHdr.DependReq) + parseFloat(value[i].MRPElementOpenQuantity);
								}
								break;
							case "PurchReq":
								if (OdataBatchHdr.PurchReq === undefined) {
									OdataBatchHdr.PurchReq = parseFloat(value[i].MRPElementOpenQuantity);
								} else {
									OdataBatchHdr.PurchReq = parseFloat(OdataBatchHdr.PurchReq) + parseFloat(value[i].MRPElementOpenQuantity);
								}
								break;
							case "Plnd order":
								if (OdataBatchHdr.Plndorder === undefined) {
									OdataBatchHdr.Plndorder = parseFloat(value[i].MRPElementOpenQuantity);
								} else {
									OdataBatchHdr.Plndorder = parseFloat(OdataBatchHdr.Plndorder) + parseFloat(value[i].MRPElementOpenQuantity);
								}
								break;
							case "IndReqmt":
								if (OdataBatchHdr.IndReqmt === undefined) {
									OdataBatchHdr.IndReqmt = parseFloat(value[i].MRPElementOpenQuantity);
								} else {
									OdataBatchHdr.IndReqmt = parseFloat(OdataBatchHdr.IndReqmt) + parseFloat(value[i].MRPElementOpenQuantity);
								}
								break;
							case "Order":
								if (OdataBatchHdr.Order === undefined) {
									OdataBatchHdr.Order = parseFloat(value[i].MRPElementOpenQuantity);
								} else {
									OdataBatchHdr.Order = parseFloat(OdataBatchHdr.Order) + parseFloat(value[i].MRPElementOpenQuantity);
								}
								break;
							case "ProdOrder":
								if (OdataBatchHdr.ProdOrder === undefined) {
									OdataBatchHdr.ProdOrder = parseFloat(value[i].MRPElementOpenQuantity);
								} else {
									OdataBatchHdr.ProdOrder = parseFloat(OdataBatchHdr.ProdOrder) + parseFloat(value[i].MRPElementOpenQuantity);
								}
								break;
							case "Delivery":
								if (OdataBatchHdr.Delivery === undefined) {
									OdataBatchHdr.Delivery = parseFloat(value[i].MRPElementOpenQuantity);
								} else {
									OdataBatchHdr.Delivery = parseFloat(OdataBatchHdr.Delivery) + parseFloat(value[i].MRPElementOpenQuantity);
								}
								break;
							case "PO item":
								if (OdataBatchHdr.POitem === undefined) {
									OdataBatchHdr.POitem = parseFloat(value[i].MRPElementOpenQuantity);
								} else {
									OdataBatchHdr.POitem = parseFloat(OdataBatchHdr.POitem) + parseFloat(value[i].MRPElementOpenQuantity);
								}
								OdataBatchHdr.MRPElementBusinessPartner = value[i].MRPElementBusinessPartner;
								break;
							case "OrderRes":
								if (OdataBatchHdr.OrderRes === undefined) {
									OdataBatchHdr.OrderRes = parseFloat(value[i].MRPElementOpenQuantity);
								} else {
									OdataBatchHdr.OrderRes = parseFloat(OdataBatchHdr.OrderRes) + parseFloat(value[i].MRPElementOpenQuantity);
								}
								break;
							case "RetrnsItem":
								if (OdataBatchHdr.RetrnsItem === undefined) {
									OdataBatchHdr.RetrnsItem = parseFloat(value[i].MRPElementOpenQuantity);
								} else {
									OdataBatchHdr.RetrnsItem = parseFloat(OdataBatchHdr.RetrnsItem) + parseFloat(value[i].MRPElementOpenQuantity);
								}
								break;
							}
						}
						if (lastRecordInd === "X") {

							//Fill AvailableStock
							if (OdataBatchHdr.SafetyStk === undefined) {
								OdataBatchHdr.SafetyStk = 0;
							}
							OdataBatchHdr.SafetyStk = parseFloat(value[i].SafetyStk);
							OdataBatchHdr.AvailableStock = parseFloat(OdataBatchHdr.Stock) - parseFloat(OdataBatchHdr.SafetyStk);
							if (OdataBatchHdr.AvailableStock === undefined || OdataBatchHdr.AvailableStock === 'NaN') {
								OdataBatchHdr.AvailableStock = 0;
							}
							if (OdataBatchHdr.AvailableStock < 0) {
								OdataBatchHdr.status = "Warning";
							}

							//Modify MRPElementAvailyOrRqmtDate
							var startDate = new Date(value[i].MRPElementAvailyOrRqmtDate);
							var newStart = startDate.toISOString();
							OdataBatchHdr.MRPElementAvailyOrRqmtDate = newStart.substr(0, 10);
							// Add other fields
							OdataBatchHdr.Material = value[i].Material;
							OdataBatchHdr.MRPPlant = value[i].MRPPlant;
							OdataBatchHdr.MRPArea = value[i].MRPArea;
							OdataBatchHdr.MRPController = value[i].MRPController;
							OdataBatchHdr.MRPAvailableQuantity = value[i].MRPAvailableQuantity;
							if (value[i].MRPAvailableQuantityDate !== undefined) {
								OdataBatchHdr.MRPAvailableQuantityDate = value[i].MRPAvailableQuantityDate.substr(0, 10);
							}
							OdataBatchHdr.MaterialBaseUnit = value[i].MaterialBaseUnit;
							OdataBatchHdr.MRPElementOpenQuantity = value[i].MRPElementOpenQuantity;
							OdataBatchHdr.MaterialName = value[i].MaterialName;
							OdataBatchCub.push(OdataBatchHdr);
							OdataBatchHdr = {};
						} else {
							if (value[i].Material !== value[i + 1].Material) {
								if (OdataBatchHdr.SafetyStk === undefined) {
									OdataBatchHdr.SafetyStk = 0;
								}
								OdataBatchHdr.SafetyStk = parseFloat(value[i].SafetyStk);
								OdataBatchHdr.AvailableStock = parseFloat(OdataBatchHdr.Stock) - parseFloat(OdataBatchHdr.SafetyStk);
								if (OdataBatchHdr.AvailableStock === undefined || OdataBatchHdr.AvailableStock === 'NaN') {
									OdataBatchHdr.AvailableStock = 0;
								}
								if (OdataBatchHdr.AvailableStock < 0) {
									OdataBatchHdr.status = "Warning";
								}
								var startDate = new Date(value[i].MRPElementAvailyOrRqmtDate);
								var newStart = startDate.toISOString();
								OdataBatchHdr.MRPElementAvailyOrRqmtDate = newStart.substr(0, 10);

								// Add other fields
								OdataBatchHdr.Material = value[i].Material;
								OdataBatchHdr.MRPPlant = value[i].MRPPlant;
								OdataBatchHdr.MRPArea = value[i].MRPArea;
								OdataBatchHdr.MRPController = value[i].MRPController;
								OdataBatchHdr.MRPAvailableQuantity = value[i].MRPAvailableQuantity;
								if (value[i].MRPAvailableQuantityDate !== undefined) {
									OdataBatchHdr.MRPAvailableQuantityDate = value[i].MRPAvailableQuantityDate.substr(0, 10);
								}
								OdataBatchHdr.MaterialBaseUnit = value[i].MaterialBaseUnit;
								OdataBatchHdr.MRPElementOpenQuantity = value[i].MRPElementOpenQuantity;
								OdataBatchHdr.MaterialName = value[i].MaterialName;
								OdataBatchCub.push(OdataBatchHdr);
								OdataBatchHdr = {};
							}
						}
					}
				}
				Data.BotList = OdataBatchCub;
				var botModel2 = new sap.ui.model.json.JSONModel();
				var oList = sap.ui.getCore().byId("container-mrpReport---Home--idTable");
				botModel2.setData(Data);
				oList.setModel(botModel2, "botTabModel");
				oList.setVisible(true);
			} else {
				sap.m.MessageToast.show("Please provide Material Number, MRP Area and Plant value");
			}
		},
		sortCategories: function (oEvent) {
			var oView = this.getView();
			var oTable = sap.ui.getCore().byId("container-mrpReport---Home--idTable");
			var oCategoriesColumn = oView.byId("Material");

			oTable.sort(oCategoriesColumn, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending,
				true);
			this._bSortColumnDescending = !this._bSortColumnDescending;
		},
		sortCategoriesAndName: function (oEvent) {
			var oView = this.getView();
			var oTable = sap.ui.getCore().byId("container-mrpReport---Home--idTable");
			oTable.sort(oView.byId("Material"), SortOrder.Ascending, false);
			oTable.sort(oView.byId("MRPPlant"), SortOrder.Ascending, true);
		},
		sortDeliveryDate: function (oEvent) {
			var oCurrentColumn = oEvent.getParameter("column");
			var oDeliveryDateColumn = this.byId("deliverydate");
			if (oCurrentColumn != oDeliveryDateColumn) {
				oDeliveryDateColumn.setSorted(false);
				return;
			}
			oEvent.preventDefault();
			var sOrder = oEvent.getParameter("sortOrder");
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "dd/MM/yyyy"
			});
			this._resetSortingState();
			oDeliveryDateColumn.setSorted(true);
			oDeliveryDateColumn.setSortOrder(sOrder);

			var oSorter = new Sorter(oDeliveryDateColumn.getSortProperty(), sOrder === SortOrder.Descending);
			oSorter.fnCompare = function (a, b) {
				if (b == null) {
					return -1;
				}
				if (a == null) {
					return 1;
				}
				var aa = oDateFormat.parse(a).getTime();
				var bb = oDateFormat.parse(b).getTime();
				if (aa < bb) {
					return -1;
				}
				if (aa > bb) {
					return 1;
				}
				return 0;
			};
			this.byId("idTable").getBinding("rows").sort(oSorter);
		},
		_resetSortingState: function () {
			var oTable = sap.ui.getCore().byId("container-mrpReport---Home--idTable");
			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				aColumns[i].setSorted(false);
			}
		}
	});
});