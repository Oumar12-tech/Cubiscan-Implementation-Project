/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(['N/search', 'N/ui/dialog', 'N/url', 'N/currentRecord'],

    function(search, dialog, url, currentRecord) {
        function fieldChanged(context) {

            var currentRecordObj = context.currentRecord;
            var fieldID = context.fieldId;

            if (fieldID === 'custpage_labelid') {

                var scannedlabelid = currentRecordObj.getValue({ fieldId: 'custpage_labelid' });

                var itemSearchObj = search.create({
                    type: "item",
                    filters: [
                        ["upccode", "is", scannedlabelid],
                        "OR",
                        ["vendorname", "is", scannedlabelid],
                        "OR",
                        ["itemid", "is", scannedlabelid]
                    ],
                    columns: [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
                });

                var itemResult = itemSearchObj.run().getRange(0, 1000);

                if (itemResult.length > 0) {
                    var internalId = itemResult[0].getValue({
                        name: "internalid",
                        label: "Internal ID"
                    });

                    currentRecordObj.setValue({ fieldId: "custpage_skuid", value: internalId });
                }
            }

            if (fieldID === 'custpage_skuid') {
                var itemInfo = currentRecordObj.getValue("custpage_skuid");

                var labelInfo = currentRecordObj.getValue("custpage_labelid");


                var output = url.resolveScript({
                    scriptId: 'customscript_wpsg_sl_cubiscan_item_info',
                    deploymentId: 'customdeploy_wpsg_sl_cubiscan_item_info',
                    returnExternalUrl: false
                });

                output+="&item="+itemInfo;
                output += "&label=" + labelInfo;



                window.open(output, '_self');
            }




        }

        function refreshSuitelet(context) {
            var scriptId = 'customscript_wpsg_sl_cubiscan_item_info';
            var deploymentId = 'customdeploy_wpsg_sl_cubiscan_item_info';

            var suiteletURL = url.resolveScript({
                scriptId: scriptId,
                deploymentId: deploymentId,
                returnExternalUrl: false
            });

            // Forcing a full page reload
            window.location.href = suiteletURL;
        }



        function submitItems(context) {
            //figuring out
        }

        return {
            fieldChanged: fieldChanged,
            submitItems: submitItems,
            refreshSuitelet: refreshSuitelet
        };

    });
