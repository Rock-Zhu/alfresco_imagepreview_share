if("application/pdf" == model.widgets[0].options.mimeType) {
	model.widgets[0].options.thumbnails.splice(0, 0, "pdfpreview");
}

var condition =
{
   attributes: {},
   plugins: []
};

condition.attributes.thumbnail = "pdfpreview";

plugin =
{
   name: "",
   attributes: {}
};


plugin.name = "PDFPreviewer";
plugin.attributes.src="pdfpreview";
plugin.attributes.paging="true";

condition.plugins.push(plugin);

var pluginConditions = eval('(' + model.widgets[0].options.pluginConditions + ')');
pluginConditions.splice(14, 0, condition);
var pluginConditionsJSON = jsonUtils.toJSONString(pluginConditions);

model.widgets[0].options.pluginConditions = pluginConditionsJSON;

