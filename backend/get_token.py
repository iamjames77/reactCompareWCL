import requests
import json

tokenURL = "https://www.warcraftlogs.com/oauth/token"

def get_token(store: bool = True):
    data = {"grant_type": "client_credentials"}
    auth = ("9c9eb67d-e840-4f7f-92c4-354f8415c98e", "GrWvaJk8BNEDlEkCQohO5pUsbsjTHc4w6LlRF57X")
    with requests.Session() as session:
        response = session.post(tokenURL, data=data, auth=auth)
    
    if store and response.status_code == 200:
        store_token(response)
    return response

def store_token(response):
    try:
        with open(".credentials.json", mode="w+", encoding="utf-8") as file:
            json.dump(response.json(), file)
    except OSError as e:
        print(e)
        return None

def read_token():
    try:
        with open(".credentials.json", mode="r+", encoding="utf-8") as file:
            access_token = json.load(file)
        return access_token.get("access_token")
    except OSError as e:
        print(e)
        return None

def retrieve_headers() -> dict:
    return {"Authorization": f"Bearer {read_token()}"}

graph_query = """query($code: String, $sourceID: Int, $dtype: GraphDataType, $fight: Int, $startTime: Float, $endTime: Float){
                reportData{
                    report(code: $code){
                        graph(sourceID: $sourceID, dataType: $dtype, fightIDs: [$fight], startTime: $startTime, endTime:$endTime, translate:false)
                }
            }
            }"""

resource_query = """query($code: String, $fight: Int, $sourceID: Int, $startTime: Float, $endTime: Float){
                reportData{
                    report(code: $code){
                        graph(abilityID: 117, sourceID: $sourceID,  targetID: $sourceID, dataType: Resources, fightIDs: [$fight], startTime: $startTime, endTime:$endTime, translate:false)
                }
            }
            }"""

graph_target_query = """query($code: String, $sourceID: Int, $targetID: Int, $dtype: GraphDataType, $fight: Int, $startTime: Float, $endTime: Float){
                reportData{
                    report(code: $code){
                        graph(sourceID: $sourceID, targetID: $targetID, dataType: $dtype, fightIDs: [$fight], startTime: $startTime, endTime:$endTime, translate: false)
                }
            }
            }"""


ALL_graph_query = """query($code: String, $dtype: GraphDataType, $fight: Int, $startTime: Float, $endTime: Float){
                reportData{
                    report(code: $code){
                        graph(dataType: $dtype, fightIDs: [$fight], startTime: $startTime, endTime:$endTime, translate: false)
                }
            }
            }"""
ALL_graph_target_query = """query($code: String, $targetID: Int, $dtype: GraphDataType, $fight: Int, $startTime: Float, $endTime: Float){
                reportData{
                    report(code: $code){
                        graph(targetID: $targetID, dataType: $dtype, fightIDs: [$fight], startTime: $startTime, endTime:$endTime, translate:false) 
                }
            }
            }"""

fightReport_query = """query($code: String){
                reportData{
                    report(code: $code){
                        fights{
                            id
                            difficulty
                            lastPhase
                            lastPhaseIsIntermission
                            phaseTransitions{id, startTime}
                            name
                            encounterID
                            bossPercentage
                            kill
                            startTime
                            endTime
                        }
                }
            }
            }"""

fightReport_query_with_encounterID = """query($code: String, $encounterID: Int){
                reportData{
                    report(code: $code){
                        fights(encounterID: $encounterID){
                            id
                            difficulty
                            lastPhase
                            lastPhaseIsIntermission
                            phaseTransitions{id, startTime}
                            name
                            encounterID
                            bossPercentage
                            kill
                            startTime
                            endTime
                        }
                }
            }
            }"""

player_query = """query($code: String, $fight: Int){
                reportData{
                    report(code: $code){
                        playerDetails(fightIDs: [$fight])
                }
            }
            }"""

phase_query = """query($code: String){
                reportData{
                    report(code: $code){
                        phases{
                            encounterID
                            phases{
                                id
                                name
                                isIntermission
                            }
                        }
                }
            }
            }"""

friendly_query = """query($code: String, $fight: Int){
                reportData{
                    report(code: $code){
                        fights(fightIDs: [$fight]){
                            friendlyNPCs{gameID, id}
                        }
                    }
                }
            }"""

enemy_query = """query($code: String, $fight: Int){
                reportData{
                    report(code: $code){
                        fights(fightIDs: [$fight]){
                            enemyNPCs{gameID, id}
                        }
                    }
                }
            }"""

master_query = """query($code: String){
                reportData{
                    report(code: $code){
                        masterData(translate: false){
                            abilities{
                                gameID
                                icon
                                name
                                type
                            }
                            npc : actors(type: "NPC"){
                                gameID
                                icon
                                id
                                name
                                subType
                            }
                        }
                    }
                }
            }"""

get_table_query = """query($code: String, $fight: Int, $sourceID: Int, $type:TableDataType ,$targetID: Int, $startTime: Float, $endTime: Float){
                reportData{
                    report(code: $code){
                        abilities: table(fightIDs: [$fight], dataType: $type, sourceID: $sourceID, startTime: $startTime, endTime: $endTime, translate: false)
                        self: table(fightIDs: [$fight], dataType: Buffs, sourceID: $sourceID, targetID: $targetID,startTime: $startTime, endTime: $endTime, translate: false)
                        global: table(fightIDs: [$fight], dataType: Buffs, sourceID: $sourceID, startTime: $startTime, endTime: $endTime, translate: false)
                        cast : table(fightIDs: [$fight], dataType: Casts, sourceID: $sourceID, startTime: $startTime, endTime: $endTime, translate: false)
                    }
                }
            }"""

get_hostility_table_query = """query($code: String, $fight: Int, $sourceID: Int, $startTime: Float, $endTime: Float){
                reportData{
                    report(code: $code){
                        table(fightIDs: [$fight], dataType: Casts, hostilityType: Enemies, sourceID: $sourceID, startTime: $startTime, endTime: $endTime, translate: false)
                    }
                }
            }"""

get_hostility_event_query = """query($code: String, $fight: Int, $sourceID: Int, $startTime: Float, $endTime: Float){
                reportData{
                    report(code: $code){
                        events(fightIDs: [$fight], dataType: Casts, hostilityType: Enemies, sourceID: $sourceID, startTime: $startTime, endTime: $endTime, translate: false)
                    }
                }
            }"""