/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */


define(['N/error', 'N/format', 'N/https', 'N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/task','N/ui/serverWidget', '/.bundle/132118/PRI_QM_Engine'],
    function(error, format, https, record, redirect, runtime, search, task, serverWidget, qmEngine) {
    function onRequest(context) {
        if (context.request.method === 'GET') {



            var form = serverWidget.createForm({
                title: 'Cubiscan Item Information'
            });

            form.clientScriptFileId = 8100605;



            var itemgroup = form.addFieldGroup({
                id: 'itemgroup',
                label: 'Original Item Information'
            });
            itemgroup.isSingleColumn = true;


            var sku = form.addField({
                id: 'custpage_skuid',
                type: serverWidget.FieldType.SELECT,
                label: 'SKU',
                container: 'itemgroup',
                source: 'item'
            });
            sku.isMandatory = true;


            var weight = form.addField({
                id: 'custpage_weightfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Weight',
                container: 'itemgroup'
            });
            weight.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            var height = form.addField({
                id: 'custpage_heightfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Height',
                container: 'itemgroup'
            });

            height.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            var width = form.addField({
                id: 'custpage_widthfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Width',
                container: 'itemgroup'
            });

            width.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            var length = form.addField({
                id: 'custpage_lengthfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Length',
                container: 'itemgroup'
            });



            length.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            //-------------- ALL SCANNED ITEM INFORMATION------------

            var scanOnlyGroup = form.addFieldGroup({
                id: 'scannedgroup',
                label: 'Scanned Item Information'
            });

            scanOnlyGroup.isSingleColumn = true;



            var scannedWeight = form.addField({
                id: 'custpage_scannedweightfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Scanned Weight',
                container: 'scannedgroup'
            });

            scannedWeight.isMandatory = true;

            var scannedHeight = form.addField({
                id: 'custpage_scannedheightfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Scanned Height',
                container: 'scannedgroup'
            });

            scannedHeight.isMandatory = true;

            var scannedWidth = form.addField({
                id: 'custpage_scannedwidthfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Scanned Width',
                container: 'scannedgroup'
            });

            scannedWidth.isMandatory = true;

            var scannedLength = form.addField({
                id: 'custpage_scannedlengthfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Scanned Length',
                container: 'scannedgroup'
            });

            scannedLength.isMandatory = true;

            var packprofile = form.addField({
                id: 'packageprofile',
                type: serverWidget.FieldType.SELECT,
                label: 'Package Profile',
                container: 'scannedgroup',
                source: 'customlist_wpsg_pack_profile_list'
            });

            packprofile.isMandatory = true;

            form.addSubmitButton({
                label: 'Submit'
            });

            var tab1 = form.addTab({
                id: 'tab1id',
                label: 'Shipping/Pacejet'
            });
            tab1.helpText = 'For future pacejet project work, empty for now';

            var tab2 = form.addTab({
                id: 'tab2id',
                label: 'Matrix'
            });

            var sublist = form.addSublist({
                id: 'custpage_sublistid',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'Sibling Items',
                tab: 'tab2id'
            });

            var selectBox = sublist.addField({
                id: 'checkboxfield',
                label: 'Select',
                type: serverWidget.FieldType.CHECKBOX
            });

            // Sublist Fields
            var nameField = sublist.addField({
                id: 'namefield',
                type: serverWidget.FieldType.TEXT,
                label: 'Name'
            });

            nameField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            var weightField = sublist.addField({
                id: 'weightfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Weight'
            });

            weightField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            var lengthField = sublist.addField({
                id: 'lengthfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Length'
            });

            lengthField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            var widthField = sublist.addField({
                id: 'widthfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Width'
            });

            widthField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            var heightField = sublist.addField({
                id: 'heightfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Height'
            });

            heightField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            var internalIdField = sublist.addField({
                id: 'internalidfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Internal ID'
            });

            internalIdField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            context.response.writePage(form);
            } else {

            var lineCount = context.request.getLineCount({group: 'custpage_sublistid'});
            var itemId = context.request.parameters.custpage_skuid;

            var itemArr = [itemId];
            var heightItem = context.request.parameters.custpage_scannedheightfield;
            var weightItem = context.request.parameters.custpage_scannedweightfield;
            var lengthItem = context.request.parameters.custpage_scannedlengthfield;
            var widthItem = context.request.parameters.custpage_scannedwidthfield;
            var packProfileItem = context.request.parameters.packageprofile;

            for( var j= 0; j < lineCount; j++){
                var selected = context.request.getSublistValue({group: 'custpage_sublistid',name: 'checkboxfield',line: j});

                if(selected === 'T'){
                    var selectedIT = context.request.getSublistValue({group: 'custpage_sublistid',name: 'internalidfield',line: j});

                    itemArr.push(selectedIT);
                }
            }
            if(itemArr.length >0 && widthItem && lengthItem && heightItem && weightItem){
                qmEngine.addQueueEntry("Cubiscan_Item_Update", {"Height": heightItem, "Weight": weightItem, "Length": lengthItem, "Width": widthItem, "PackageProfile": packProfileItem,  "itemArray": itemArr}, null, true, "customscript_wpsg_ss_cubiscan_item_updat");
            }

            redirect.toSuitelet({
                scriptId: 'customscript_wpsg_sl_cubiscan_item_info',
                deploymentId: 'customdeploy_wpsg_sl_cubiscan_item_info',
            });


        }

    }
    return {
        onRequest: onRequest
    };
});


