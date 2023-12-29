/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

define(['N/error', 'N/format', 'N/https', 'N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/task', 'N/ui/serverWidget', '/.bundle/132118/PRI_QM_Engine', 'N/ui/dialog'],
    function(error, format, https, record, redirect, runtime, search, task, serverWidget, qmEngine, dialog) {
        function onRequest(context) {
            if (context.request.method === 'GET') {
                var form = serverWidget.createForm({
                    title: 'Cubiscan Item Information'
                });

                var item = context.request.parameters.item;
                var label = context.request.parameters.label;

                form.clientScriptFileId = 10333970;

                var itemgroup = form.addFieldGroup({
                    id: 'itemgroup',
                    label: 'Original Item Information'
                });
                itemgroup.isSingleColumn = true;

                // Label field
                var scannedLabel = form.addField({
                    id: 'custpage_labelid',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Label',
                    container: 'itemgroup'
                });


                //scannedLabel.isMandatory = true;
                scannedLabel.defaultValue = label;

                // SKU field
                var sku = form.addField({
                    id: 'custpage_skuid',
                    type: serverWidget.FieldType.SELECT,
                    label: 'SKU',
                    container: 'itemgroup',
                    source: 'item'
                });
                sku.isDisabled = true;

                sku.defaultValue = item;

                if (item != '' && item != undefined) {

                    scannedLabel.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });

                    sku.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                }


                // Weight field
                var weight = form.addField({
                    id: 'custpage_weightfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Weight',
                    container: 'itemgroup'
                });
                weight.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                // Height field
                var height = form.addField({
                    id: 'custpage_heightfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Height',
                    container: 'itemgroup'
                });
                height.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                // Width field
                var width = form.addField({
                    id: 'custpage_widthfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Width',
                    container: 'itemgroup'
                });
                width.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                // Length field
                var length = form.addField({
                    id: 'custpage_lengthfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Length',
                    container: 'itemgroup'
                });
                length.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                var headerItemType = form.addField({
                    id: 'custpage_itemtype',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Item Type'
                });

                headerItemType.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                if (item != '' && item != undefined) {
                    var fieldLookUp = search.lookupFields({
                        type: 'item',
                        id: item,
                        columns: ['weight', 'custitem_pacejet_item_length', 'custitem_pacejet_item_height', 'custitem_pacejet_item_width', 'custitem_wpsg_pack_profile', 'parent', 'type']
                    });

                    log.debug({
                        title: 'Field Lookup Result',
                        details: JSON.stringify(fieldLookUp)
                    }); //Added log debug

                    if (fieldLookUp.weight != '' && fieldLookUp.weight != null) {

                        weight.defaultValue = fieldLookUp.weight;
                    }

                    if (fieldLookUp.custitem_pacejet_item_length != '' && fieldLookUp.custitem_pacejet_item_length != null) {

                        length.defaultValue = fieldLookUp.custitem_pacejet_item_length;
                    }

                    if (fieldLookUp.custitem_pacejet_item_height != '' && fieldLookUp.custitem_pacejet_item_height != null) {
                        height.defaultValue = fieldLookUp.custitem_pacejet_item_height;
                    }
                    if (fieldLookUp.custitem_pacejet_item_width != '' && fieldLookUp.custitem_pacejet_item_width != null) {
                        width.defaultValue = fieldLookUp.custitem_pacejet_item_width;
                    }

                    log.debug({title: 'Field Look Up', details: fieldLookUp.type});
                    if (fieldLookUp.type != '' && fieldLookUp.type != null) {
                        headerItemType.defaultValue = fieldLookUp.type[0].value; //Added the index
                    }

                }

                // Scanned Item Information
                var scanOnlyGroup = form.addFieldGroup({
                    id: 'scannedgroup',
                    label: 'Scanned Item Information'
                });
                scanOnlyGroup.isSingleColumn = true;

                // Scanned Weight field

                var scannedWeight = form.addField({
                        id: 'custpage_scannedweightfield',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Scanned Weight',
                        container: 'scannedgroup'
                });

                scannedWeight.isMandatory = true;

                // Scanned Height field
                var scannedHeight = form.addField({
                    id: 'custpage_scannedheightfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Scanned Height',
                    container: 'scannedgroup'
                });
                scannedHeight.isMandatory = true;

                // Scanned Width field
                var scannedWidth = form.addField({
                    id: 'custpage_scannedwidthfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Scanned Width',
                    container: 'scannedgroup'
                });
                scannedWidth.isMandatory = true;

                // Scanned Length field
                var scannedLength = form.addField({
                    id: 'custpage_scannedlengthfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Scanned Length',
                    container: 'scannedgroup'
                });
                scannedLength.isMandatory = true;

                // Package Profile field
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

                var list = form.addSublist({
                    id: 'custpage_listid',
                    type: serverWidget.SublistType.LIST,
                    label: 'Sibling Items'
                });

                list.addMarkAllButtons();


                form.addButton({
                    id: 'custpage_refresh_button',
                    label: 'Refresh',
                    functionName: 'refreshSuitelet'
                });

                var selectBox = list.addField({
                    id: 'checkboxfield',
                    label: 'Select',
                    type: serverWidget.FieldType.CHECKBOX
                });

                // List Fields
                var nameField = list.addField({
                    id: 'namefield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Name'
                });

                nameField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                var weightField = list.addField({
                    id: 'weightfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Weight'
                });
                weightField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                var lengthField = list.addField({
                    id: 'lengthfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Length'
                });
                lengthField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                var widthField = list.addField({
                    id: 'widthfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Width'
                });
                widthField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                var heightField = list.addField({
                    id: 'heightfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Height'
                });
                heightField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                var internalIdField = list.addField({
                    id: 'internalidfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Internal ID'
                });
                
                internalIdField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });


                var itemType = list.addField({
                    id: 'itemtype',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Item Type'
                });

                itemType.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                if (item != '' && item != undefined) {

                    if (fieldLookUp.parent[0] != '' && fieldLookUp.parent[0] != undefined) {
                        if (fieldLookUp.parent[0].value != '' && fieldLookUp.parent[0].value != undefined) {
                            var itemSearchObj = search.create({
                                type: "item",
                                filters: 
                                    [
                                        ["isinactive", "is", "F"],
                                        "AND",
                                        ["matrixchild", "is", "T"],
                                        "AND",
                                        ["parent", "anyof", fieldLookUp.parent[0].value],
                                        "AND",
                                        ["internalid", "noneof", item]
                                    ],
                                columns:
                                    [
                                        search.createColumn({
                                            name: "itemid",
                                            sort: search.Sort.ASC,
                                            label: "Name"
                                        }),
                                        search.createColumn({
                                            name: "type",
                                            sort: search.Sort.ASC,
                                            label: "Type"
                                        }),

                                        search.createColumn({name: "weight", label: "Weight"}),
                                        search.createColumn({
                                            name: "custitem_pacejet_item_length",
                                            label: "Item Length"
                                        }),
                                        search.createColumn({name: "custitem_pacejet_item_width", label: "Item Width"}),
                                        search.createColumn({
                                            name: "custitem_pacejet_item_height",
                                            label: "Item Height"
                                        }),
                                        search.createColumn({name: "internalid", label: "Internal ID"})
                                    ]

                            });

                            var itemResult = itemSearchObj.run().getRange(0, 1000);

                            if (itemResult != undefined && itemResult.length > 0) {
                                for (var i = 0; i < itemResult.length; i++) {
                                    var name = itemResult[i].getValue({
                                        name: "itemid",
                                        label: "Name"
                                    });

                                    var weight = itemResult[i].getValue({
                                        name: "weight",
                                        label: "Weight"
                                    });
                                    var length = itemResult[i].getValue({
                                        name: "custitem_pacejet_item_length",
                                        label: "Item Length"
                                    });

                                    var width = itemResult[i].getValue({
                                        name: "custitem_pacejet_item_width",
                                        label: "Item Width"
                                    });

                                    var height = itemResult[i].getValue({
                                        name: "custitem_pacejet_item_height",
                                        label: "Item Height"
                                    });

                                    var packProfile = itemResult[i].getValue({
                                        name: "packageprofile",
                                        label: "Package Profile"
                                    });

                                    var internalid = itemResult[i].getValue({
                                        name: "internalid",
                                        label: "Internal ID"
                                    });

                                    var itemType = itemResult[i].getValue({
                                        name: "type",
                                        label: "Type"
                                    });

                                    log.debug('Type', itemType);

                                    list.setSublistValue({
                                        id: "type",
                                        line: i,
                                        value: itemType
                                    });

                                    list.setSublistValue({
                                        id: "internalidfield",
                                        line: i,
                                        value: internalid
                                    });


                                    list.setSublistValue({
                                        id: "namefield",
                                        line: i,
                                        value: name
                                    });

                                    log.debug(weight);

                                    if (weight != '' && weight != undefined) {

                                        list.setSublistValue({
                                            id: "weightfield",
                                            line: i,
                                            value: weight
                                        });
                                    }

                                    if (length != '' && length != undefined) {
                                        list.setSublistValue({
                                            id: "lengthfield",
                                            line: i,
                                            value: length
                                        });
                                    }

                                    if (width != '' && width != undefined) {
                                        list.setSublistValue({
                                            id: "widthfield",
                                            line: i,
                                            value: width
                                        });
                                    }

                                    if (height != '' && height != undefined) {
                                        list.setSublistValue({
                                            id: "heightfield",
                                            line: i,
                                            value: height
                                        });
                                    }

                                    if (packprofile != '' && packprofile != undefined) {

                                        list.setSublistValue({
                                            id: "packageprofile",
                                            line: i,
                                            value: packProfile
                                        });
                                    }

                                    log.debug(packprofile);




                                }


                            }

                        }
                    }
                }



                context.response.writePage(form);
            } else {
                // Handling form submission and logic here

                var lineCount = context.request.getLineCount({
                    group: 'custpage_listid'
                });

                var itemTypeRequest = context.request.parameters.custpage_itemtype;

                var itemId = context.request.parameters.custpage_skuid;

                var itemArr = [itemId];
                var heightItem = context.request.parameters.custpage_scannedheightfield;
                var weightItem = context.request.parameters.custpage_scannedweightfield;
                var lengthItem = context.request.parameters.custpage_scannedlengthfield;
                var widthItem = context.request.parameters.custpage_scannedwidthfield;
                var packProfileItem = context.request.parameters.packageprofile;

                for (var j = 0; j < lineCount; j++) {
                    var selected = context.request.getSublistValue({
                        group: 'custpage_listid',
                        name: 'checkboxfield',
                        line: j
                    });

                    if (selected === 'T') {
                        var selectedIT = context.request.getSublistValue({
                            group: 'custpage_listid',
                            name: 'internalidfield',
                            line: j
                        });

                        log.debug(selectedIT);

                        itemArr.push(selectedIT);
                    }
                }

                if (itemArr.length > 0 && widthItem && lengthItem && heightItem && weightItem) {
                    qmEngine.addQueueEntry("Cubiscan_Item_Update", {
                        "Height": heightItem,
                        "Weight": weightItem,
                        "Length": lengthItem,
                        "Width": widthItem,
                        "PackageProfile": packProfileItem,
                        "ItemType" : itemTypeRequest,
                        "itemArray": itemArr
                    }, null, true, "customscript_wpsg_ss_cubiscan_item_updat");
                }

                redirect.toSuitelet({
                    scriptId: 'customscript_wpsg_sl_cubiscan_item_info',
                    deploymentId: 'customdeploy_wpsg_sl_cubiscan_item_info'
                });
            }
        }

        return {
            onRequest: onRequest
        };
    });
