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
                                for (i = 0; i < items.length; i++){
                                    var itemRecord = record.load({
                                        type: 'inventoryitem',
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
