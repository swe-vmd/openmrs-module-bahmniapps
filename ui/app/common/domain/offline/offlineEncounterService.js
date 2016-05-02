'use strict';

angular.module('bahmni.common.domain')
    .service('encounterService', ['$q', '$rootScope', '$bahmniCookieStore', 'offlineEncounterServiceStrategy',
        function ($q, $rootScope,  $bahmniCookieStore, offlineEncounterService) {

            this.buildEncounter = function (encounter) {
                encounter.observations = encounter.observations || [];
                encounter.observations.forEach(function (obs) {
                    stripExtraInfo(obs);
                });

                encounter.providers = encounter.providers || [];

                var providerData = $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
                if (_.isEmpty(encounter.providers)) {
                    if (providerData && providerData.uuid) {
                        encounter.providers.push({"uuid": providerData.uuid});
                    } else if ($rootScope.currentProvider && $rootScope.currentProvider.uuid) {
                        encounter.providers.push({"uuid": $rootScope.currentProvider.uuid});
                    }
                }
                return encounter;
            };

            var getDefaultEncounterType = function () {
                return offlineEncounterService.getDefaultEncounterType();
            };

            var getEncounterTypeBasedOnLoginLocation = function () {
                return offlineEncounterService.getEncounterTypeBasedOnLoginLocation();
            };

            var getEncounterTypeBasedOnProgramUuid = function (programUuid) {
                return offlineEncounterService.getEncounterTypeBasedOnProgramUuid();
            };

            var getDefaultEncounterTypeIfMappingNotFound = function (mapping) {
                var encounterType = mapping;
                if (!encounterType) {
                    encounterType = getDefaultEncounterType();
                }
                return encounterType;

            };

            this.getEncounterType = function (programUuid, loginLocationUuid) {
                if (programUuid) {
                    return getEncounterTypeBasedOnProgramUuid(programUuid).then(function (response) {
                        return getDefaultEncounterTypeIfMappingNotFound(response);
                    });
                }
                else if (loginLocationUuid) {
                    return getEncounterTypeBasedOnLoginLocation().then(function (response) {
                        return getDefaultEncounterTypeIfMappingNotFound(response.data);
                    });
                } else {
                    return getDefaultEncounterType();
                }

            };


            this.create = function (encounterData) {
                this.buildEncounter(encounterData);
                encounterData.encounterUuid = encounterData.encounterUuid || Bahmni.Common.Offline.UUID.generateUuid();
                encounterData.visitUuid = encounterData.visitUuid || Bahmni.Common.Constants.newOfflineVisitUuid;
                encounterData.encounterDateTime = encounterData.encounterDateTime || Bahmni.Common.Util.DateUtil.now();
                encounterData.visitType = encounterData.visitType || 'Field';
                return getDefaultEncounterType().then(function (encounterType) {
                    encounterData.encounterType = encounterData.encounterType || encounterType.value;
                    return encounterData;
                }).then(function(encounterData) {
                    return offlineEncounterService.create(encounterData);
                })
            };

            this.delete = function (encounterUuid, reason) {
                return offlineEncounterService.delete(encounterUuid, reason);
            };

            var stripExtraInfo = function (obs) {
                delete obs.isObservation;
                delete obs.isObservationNode;
                obs.concept = {uuid: obs.concept.uuid, name: obs.concept.name, dataType: obs.concept.dataType};
                obs.groupMembers = obs.groupMembers || [];
                obs.groupMembers.forEach(function (groupMember) {
                    stripExtraInfo(groupMember);
                });
            };

            var searchWithoutEncounterDate = function (visitUuid) {
                return $q.when({"data": {"results": []}})
            };

            this.search = function (visitUuid, encounterDate) {
                return offlineEncounterService.search(visitUuid, encounterDate);
            };

            this.find = function (params) {
                return offlineEncounterService.find(params).then(function(results) {
                    if(results && results[0] && results[0].encounter)
                        return {data: results[0].encounter};
                    else
                        return {"data":{
                            "bahmniDiagnoses": [],
                            "observations": [],
                            "accessionNotes": [],
                            "encounterType": null,
                            "visitType": null,
                            "patientId": null,
                            "reason": null,
                            "orders": [],
                            "providers": [],
                            "drugOrders": [],
                            "patientProgramUuid": null,
                            "visitUuid": null,
                            "patientUuid": null,
                            "encounterDateTime": null,
                            "associatedToPatientProgram": false,
                            "encounterUuid": null,
                            "visitTypeUuid": null,
                            "encounterTypeUuid": null,
                            "locationUuid": null,
                            "disposition": null,
                            "locationName": null,
                            "context": {},
                            "extensions": {}
                        }};
                });
            };

            this.findByEncounterUuid = function (encounterUuid) {
                return $q.when({"data": {"results": []}})
            };

            this.getEncountersForEncounterType = function (patientUuid, encounterTypeUuid) {
                return $q.when({"data": {"results": []}})
            };

            this.getDigitized = function (patientUuid) {
                return $q.when({"data": {"results": []}});
            };

            this.discharge = function (encounterData) {
                return $q.when({"data": {"results": []}});
            };
        }]);
