from flask import Flask, request, jsonify, send_from_directory
import os
import requests
import json
import re
from get_token import retrieve_headers, query, graph_query, fightReport_query, player_query, ALL_query, ALL_graph_query

app = Flask(__name__, static_folder='../frontend/build')

publicURL = "https://www.warcraftlogs.com/api/v2/client"

def make_icon_spell_dict(table, spellDict, tableType):
    if tableType == "cast":
        key = 'entries'
    else:
        key = 'auras'
    for entry in table[key]:
        if entry["guid"] not in spellDict:
            spellDict[entry["guid"]] = {'name': entry["name"], 'icon': entry["abilityIcon"]}
    return spellDict


def get_api_data(query: str, **kwargs):
    """Fetch data from the Warcraft Logs API. Please provide a query and the parameters"""
    data = {"query": query, "variables": kwargs}
    with requests.Session() as session:
        session.headers = retrieve_headers()
        response = session.post(publicURL, json=data)
    return response.json()

@app.route('/get_data', methods=['POST'])
def get_data():
    data = request.get_json()
    reportId, fight, source = data.get('reportId'), int(data.get('fight')), data.get('source')
    if(source != 'ALL'):
        response = get_api_data(query, code=reportId, sourceID=int(source), fight=fight)
    else:
        response = get_api_data(ALL_query, code=reportId, fight=fight)
    return jsonify(response)

@app.route('/get_graph_data', methods=['POST'])
def get_graph_data():
    data = request.get_json()
    report, fight, source, dtype, startTime, endTime = data.get('reportId'), int(data.get('fight')), data.get('source'), data.get('type'), float(data.get('startTime')), float(data.get('endTime'))
    print(source)
    if(source == 'ALL'):
        response = get_api_data(ALL_graph_query, code=report, fight=fight, dtype=dtype, startTime=startTime, endTime=endTime)
    else:
        response = get_api_data(graph_query, code=report, sourceID=int(source), fight=fight, dtype=dtype, startTime=startTime, endTime=endTime)
    return jsonify(response)

@app.route('/get_fight_data', methods=['POST'])
def get_fight_data():
    data = request.get_json()
    report = data.get('reportId')
    response = get_api_data(fightReport_query, code=report)
    return jsonify(response)

@app.route('/get_player_details', methods=['POST'])
def get_player_details():
    data = request.get_json()
    report, fight = data.get('reportId'), data.get('fight')
    response = get_api_data(player_query, code=report, fight =fight)
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