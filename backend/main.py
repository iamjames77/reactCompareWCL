from flask import Flask, request, jsonify, send_from_directory
import os
import requests
import json
import re
from get_token import *

app = Flask(__name__, static_folder='../frontend/build')

publicURL = "https://www.warcraftlogs.com/api/v2/client"

def get_api_data(query: str, **kwargs):
    """Fetch data from the Warcraft Logs API. Please provide a query and the parameters"""
    data = {"query": query, "variables": kwargs}
    with requests.Session() as session:
        session.headers = retrieve_headers()
        response = session.post(publicURL, json=data)
    return response.json()

@app.route('/get_graph_data', methods=['POST'])
def get_graph_data():
    data = request.get_json()
    report, fight, source, target, dtype, startTime, endTime = data.get('reportID'), int(data.get('fight')), data.get('source'), data.get('target'), data.get('type'), float(data.get('startTime')), float(data.get('endTime'))
    if(source == 'ALL'):
        if(target == 'ALL'):
            response = get_api_data(ALL_graph_query, code=report, fight=fight, dtype=dtype, startTime=startTime, endTime=endTime)
        else:
            response = get_api_data(ALL_graph_target_query, code=report, fight=fight, dtype=dtype, targetID=int(target), startTime=startTime, endTime=endTime)
    else:
        if(target == 'ALL'):
            response = get_api_data(graph_query, code=report, sourceID=int(source), fight=fight, dtype=dtype, startTime=startTime, endTime=endTime)
        else:
            response = get_api_data(graph_target_query, code=report, sourceID=int(source), targetID=int(target), fight=fight, dtype=dtype, startTime=startTime, endTime=endTime)
    return jsonify(response)

@app.route('/get_fight_data', methods=['POST'])
def get_fight_data():
    data = request.get_json()
    report = data.get('reportID')
    response = get_api_data(fightReport_query, code=report)
    return jsonify(response)

@app.route('/get_player_details', methods=['POST'])
def get_player_details():
    data = request.get_json()
    print(data)
    report, fight = data.get('reportID'), data.get('fight')
    response = get_api_data(player_query, code=report, fight =fight)
    return jsonify(response)

@app.route('/get_fight_data_with_encounterID', methods=['POST'])
def get_fight_data_with_encounterID():
    data = request.get_json()
    report, encounterID = data.get('reportID'), data.get('encounterID')
    response = get_api_data(fightReport_query_with_encounterID, code=report, encounterID=encounterID)
    return jsonify(response)

@app.route('/get_phase_info', methods=['POST'])
def get_phase_info():
    data = request.get_json()
    report = data.get('reportID')
    response = get_api_data(phase_query, code=report)
    return jsonify(response)

@app.route('/get_friendly_data', methods=['POST'])
def get_friendly_data():
    data = request.get_json()
    report, fight = data.get('reportID'), int(data.get('fight'))
    response = get_api_data(friendly_query, code=report, fight =fight)
    return jsonify(response)

@app.route('/get_enemy_data', methods=['POST'])
def get_enemy_data():
    data = request.get_json()
    report, fight = data.get('reportID'), int(data.get('fight'))
    response = get_api_data(enemy_query, code=report, fight =fight)
    return jsonify(response)

@app.route('/get_master_data', methods=['POST'])
def get_master_data():
    data = request.get_json()
    report = data.get('reportID')
    response = get_api_data(master_query, code=report)
    return jsonify(response)

@app.route('/get_table_data', methods=['POST'])
def get_buff_data():
    data = request.get_json()
    report, fight, source, target, startTime, endTime, type = data.get('reportID'), int(data.get('fight')), data.get('source'), data.get('target'), float(data.get('startTime')), float(data.get('endTime')), data.get('type')
    response = get_api_data(get_table_query, code=report, fight= fight, type=type, sourceID=source, targetID=target, startTime= startTime, endTime = endTime)
    return jsonify(response)

@app.route('/get_hostility_table_data', methods=['POST'])
def get_hostility_table_data():
    data = request.get_json()
    report, fight, source, startTime, endTime = data.get('reportID'), int(data.get('fight')), data.get('source'), float(data.get('startTime')), float(data.get('endTime'))
    response = get_api_data(get_hostility_table_query, code=report, fight= fight, sourceID=source, startTime= startTime, endTime = endTime)
    return jsonify(response)

@app.route('/get_hostility_event_data', methods=['POST'])
def get_hostility_event_data():
    data = request.get_json()
    report, fight, source, startTime, endTime = data.get('reportID'), int(data.get('fight')), data.get('source'), float(data.get('startTime')), float(data.get('endTime'))
    response = get_api_data(get_hostility_event_query, code=report, fight= fight, sourceID=source, startTime= startTime, endTime = endTime)
    return jsonify(response)

@app.route('/get_buffs_event_data', methods=['POST'])
def get_buffs_event_data():
    data = request.get_json()
    report, fight, source, abilityID, startTime, endTime = data.get('reportID'), int(data.get('fight')), data.get('source'), float(data.get('abilityID')), float(data.get('startTime')), float(data.get('endTime'))
    print(report, fight, source, abilityID, startTime, endTime)
    response = get_api_data(get_buffs_event_query, code=report, abilityID= abilityID,fight= fight, startTime= startTime, endTime = endTime)
    filter_response = {'data': [data for data in response['data']['reportData']['report']['events']['data'] if data['targetID'] == source], 'nextPagetTimestamp': response['data']['reportData']['report']['events']['nextPageTimestamp']}
    print(filter_response)
    return jsonify(filter_response)

@app.route('/get_casts_event_data', methods=['POST'])
def get_casts_event_data():
    data = request.get_json()
    report, fight, source, startTime, endTime = data.get('reportID'), int(data.get('fight')), data.get('source'), float(data.get('startTime')), float(data.get('endTime'))
    response = get_api_data(get_casts_event_query, code=report, fight= fight, sourceID=source, startTime= startTime, endTime = endTime)
    return jsonify(response)

@app.route('/get_resource_data', methods=['POST'])
def get_resource_data():
    data = request.get_json()
    report, fight, source, abilityID, startTime, endTime, type, byTarget = data.get('reportID'), int(data.get('fight')), data.get('source'), data.get('abilityID'),float(data.get('startTime')), float(data.get('endTime')), data.get('type'), data.get('byTarget')
    if(byTarget):
        response = get_api_data(get_resource_query, code=report, fight= fight, targetID=source, abilityID=abilityID,startTime= startTime, endTime = endTime, type = type)
    else:
        response = get_api_data(get_resource_query, code=report, fight= fight, sourceID=source, targetID=source, abilityID=abilityID,startTime= startTime, endTime = endTime, type = type)
    return jsonify(response)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)