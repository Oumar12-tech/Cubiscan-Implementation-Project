/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/error', 'N/record', 'N/runtime', 'N/search', 'N/task', '/.bundle/132118/PRI_QM_Engine'],
    /**
 * @param{error} error
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{task} task
 */
    (error, record, runtime, search, task, qmEngine) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            var min_usage_threshold = 500;

            CubiscanUpdate(min_usage_threshold);
        }

        const  rescheduleScript =() => {
            try {
                var scriptTask = task.create({'taskType' : task.TaskType.SCHEDULED_SCRIPT});
                scriptTask.scriptId = "customscript_wpsg_ss_cubiscan";
                var scriptTaskId = scriptTask.submit();
                log.audit('Cubiscan Update', "Script rescheduled");
            } catch (error) {
                log.error('Cubiscan Update', "Failed to reschedule script: " + error.message);
            }
        }

        const CubiscanUpdate = (min_usage_threshold) =>{
            try {

                var allDone  			= false;
                var funcName 			= 'Cubiscan Update';
                log.debug("Cubiscan", "*** STARTING ***");

                do {
                    var obj = qmEngine.getNextQueueEntry("Cubiscan_Item_Update");

                    if (obj !== null && typeof obj === 'object') {

                        log.debug(funcName, "Processing next record: " + JSON.stringify(obj));

                        var parms = JSON.parse(obj.parms);
                        log.debug('parms',parms);

                        try {



                                var items = parms.itemArray ;

                                var firstItem = items[0];

                                var itemSearchObj = search.create({
   type: "item",
   filters:
   [
      ["internalid","anyof",firstItem]
   ],
   columns:
   [
      search.createColumn({name: "internalid", label: "Internal ID"})
   ]
});

                                var searchResultCount = itemSearchObj.run().getRange(0,1);

                                var itemTypeUpdate = searchResultCount[0].recordType;

                                var itemTypeInfo = parms.itemType;

                                if (itemTypeInfo == 'Assembly'){
                                    var itemTypeSet = record.Type.ASSEMBLY_ITEM;

                                }
                                else if (itemTypeInfo == 'InvtPart'){
                                    var itemTypeSet = record.Type.INVENTORY_ITEM;
                                }
                                for (i = 0; i < items.length; i++){


                                    log.debug('itemType', items[i]);
                                    log.debug('itemTypeSet', itemTypeSet);

                                    var itemRecord = record.load({
                                        type: itemTypeUpdate,
                                        id: items[i]
                                    });


                                    itemRecord.setValue({
                                        fieldId: 'custitem_pacejet_item_height',
                                        value: parms.Height
                                    });

                                    itemRecord.setValue({
                                        fieldId: 'custitem_pacejet_item_length',
                                        value: parms.Length
                                    });

                                    itemRecord.setValue({
                                        fieldId: 'custitem_pacejet_item_width',
                                        value: parms.Width
                                    });

                                    itemRecord.setValue({
                                        fieldId: 'weight',
                                        value: parms.Weight
                                    });

                                    itemRecord.setValue({
                                        fieldId: 'custitem_wpsg_pack_profile',
                                        value: parms.PackageProfile
                                    });

                                    if (i == 0){
                                        itemRecord.setValue({
                                            fieldId: 'custitem_wpsg_dimension_update_type',
                                            value: 8 //Scanner
                                        });
                                    } else {
                                        itemRecord.setValue({
                                            fieldId: 'custitem_wpsg_dimension_update_type',
                                            value: 9 //Scanner Sibling
                                        });
                                    }

                                    //log.debug({title: 'Package Profile', details: parms.PackageProfile});

                                   var saveRecord = itemRecord.save();

                                   log.debug({
                                       title: 'Saved:',
                                       details: saveRecord
                                   });
                                }

                                qmEngine.markQueueEntryComplete(obj.id);

                        }catch (error) {
                            if (error.name == "RCRD_DSNT_EXIST") {
                                qmEngine.markQueueEntryComplete(obj.id, "Record no longer exists, and this entry was abandoned.");
                            } else {
                                log.error(funcName, error);
                                qmEngine.abandonQueueEntry(obj.id, null, "ERROR: " + JSON.stringify(error));
                            }
                        }

                        if (runtime.getCurrentScript().getRemainingUsage() < min_usage_threshold) {
                            log.debug(funcName, "Running out of resources and attempting to reschedule");
                            rescheduleScript();
                            allDone = true;
                        }

                    } else
                        allDone = true;

                } while (!allDone);

                log.debug(funcName, "Exiting");

            } catch (e) {
                log.error(funcName, e);
            }
        }

        return {execute}

    });
