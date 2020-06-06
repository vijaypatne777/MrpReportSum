function initModel() {
	var sUrl = "/OPENSAP/sap/opu/odata/sap/API_MRP_MATERIALS_SRV_01/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}