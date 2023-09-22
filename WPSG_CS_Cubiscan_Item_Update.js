/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(['N/search', 'N/ui/dialog', 'N/url', 'N/currentRecord'],

function(search, dialog, url, currentRecord) {
    function fieldChanged(context) {

        var currentRecord = context.currentRecord;
        var fieldID = context.fieldId;
        console.log('field changed');

        if (fieldID === 'custpage_skuid'){
            var weightid = currentRecord.getValue({fieldId: 'custpage_skuid'});
            var fieldLookUp = search.lookupFields({
                type: 'item',
                id: weightid,
                columns: ['weight','custitem_pacejet_item_length', 'custitem_pacejet_item_height', 'custitem_pacejet_item_width', 'custitem_wpsg_pack_profile', 'parent']
            });

            console.log('Weights', fieldLookUp.weight);

            if (fieldLookUp.weight){
                currentRecord.setValue({fieldId: 'custpage_weightfield', value: fieldLookUp.weight});

            }

            if (fieldLookUp.custitem_pacejet_item_length){
                currentRecord.setValue({fieldId: 'custpage_lengthfield', value: fieldLookUp.custitem_pacejet_item_length});
            }
            if (fieldLookUp.custitem_pacejet_item_height){
                currentRecord.setValue({fieldId: 'custpage_heightfield', value: fieldLookUp.custitem_pacejet_item_height});
            }
            if (fieldLookUp.custitem_pacejet_item_width){
                currentRecord.setValue({fieldId: 'custpage_widthfield', value: fieldLookUp.custitem_pacejet_item_width});
            }


            if (parent[0] != '' && fieldLookUp.parent[0] != undefined){
                if (fieldLookUp.parent[0].value != '' && fieldLookUp.parent[0].value != undefined){
                    var itemSearchObj = search.create({
                        type: "item",
                        filters:
                            [
                                ["isinactive","is","F"],
                                "AND",
                                ["matrixchild","is","T"],
                                "AND",
                                ["parent","anyof",fieldLookUp.parent[0].value],
                                "AND",
                                ["internalid","noneof", weightid]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "itemid",
                                    sort: search.Sort.ASC,
                                    label: "Name"
                                }),

                                search.createColumn({name: "weight", label: "Weight"}),
                                search.createColumn({name: "custitem_pacejet_item_length", label: "Item Length"}),
                                search.createColumn({name: "custitem_pacejet_item_width", label: "Item Width"}),
                                search.createColumn({name: "custitem_pacejet_item_height", label: "Item Height"}),
                                search.createColumn({name: "internalid", label: "Internal ID"})
                            ]

                    });

                    var itemResult = itemSearchObj.run().getRange(0,1000);

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


                            currentRecord.selectNewLine({
                                sublistId: 'custpage_sublistid'
                            });
                            console.log

                            currentRecord.setCurrentSublistValue({
                                sublistId: "custpage_sublistid",
                                fieldId: "namefield",
                                value: name
                            });


                            currentRecord.setCurrentSublistValue({
                                sublistId: "custpage_sublistid",
                                fieldId: "weightfield",
                                value: weight
                            });

                            currentRecord.setCurrentSublistValue({
                                sublistId: "custpage_sublistid",
                                fieldId: "widthfield",
                                value: width
                            });
                            currentRecord.setCurrentSublistValue({
                                sublistId: "custpage_sublistid",
                                fieldId: "lengthfield",
                                value: length
                            });
                            currentRecord.setCurrentSublistValue({
                                sublistId: "custpage_sublistid",
                                fieldId: "heightfield",
                                value: height
                            });

                            currentRecord.setCurrentSublistValue({
                                sublistId: "custpage_sublistid",
                                fieldId: "packageprofile",
                                value: packProfile
                            });

                            currentRecord.setCurrentSublistValue({
                                sublistId: "custpage_sublistid",
                                fieldId: "internalidfield",
                                value: internalid
                            });

                            currentRecord.commitLine({
                                sublistId: 'custpage_sublistid'
                            });

                        }
                        var lineCount = currentRecord.getLineCount({sublistId: 'custpage_sublistid'});

                        console.log("SS lines: " + lineCount);

                    }

                }
            }

        }

    }

    function submitItems(context){
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
            qmEngine.addQueueEntry("Cubiscan_Item_Update", {"Height": heightItem, "Weight": weightItem, "Length": lengthItem, "Width": widthItem, "PackageProfile": packProfileItem, "itemArray": itemArr}, null, true, "customscript_wpsg_ss_cubiscan_item_updat");
        }

        currentRecord.getCurrentSublistValue({
            sublistId: 'custpage_sublistid',
            fieldId: 'heightfield'
        });

        currentRecord.getCurrentSublistValue({
            sublistId: 'custpage_sublistid',
            fieldId: 'lengthfield'
        });

        currentRecord.getCurrentSublistValue({
            sublistId: 'custpage_sublistid',
            fieldId: 'widthfield'
        });

        currentRecord.getCurrentSublistValue({
            sublistId: 'custpage_sublistid',
            fieldId: 'weightfield'
        });

        currentRecord.getCurrentSublistValue({
            sublistId: 'custpage_sublistid',
            fieldId: 'internalidfield'
        });

        var internalIdsArray = [];


        var fieldIds = ['heightfield', 'lengthfield', 'widthfield', 'weightfield', 'internalidfield'];


        for (var i = 0; i < fieldIds.length; i++) {
            var fieldId = fieldIds[i];
            var internalIdValue = currentRecord.getCurrentSublistValue({
                sublistId: 'custpage_sublistid',
                fieldId: fieldId
            });

            internalIdsArray.push(internalIdValue);
        }

    }



    return {
        fieldChanged: fieldChanged,
        submitItems: submitItems
    };
    
});
