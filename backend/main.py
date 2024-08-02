from flask import Flask, request, jsonify, send_from_directory
import os
import requests
import json
import re
from get_token import retrieve_headers, query, graph_query, fightReport_query

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
    reportId, fight, source = data.get('reportId'), int(data.get('fight')), int(data.get('source'))
    response = get_api_data(query, code=reportId, sourceID=source, fight=fight)
    print(reportId)
    return jsonify(response)

@app.route('/get_graph_data')
def get_graph_data():
    report, fight, source, dtype, startTime, endTime = request.args.get('report'), request.args.get('fight'), request.args.get('source'), request.args.get('dtype'), request.args.get('startTime'), request.args.get('endTime')
    response = get_api_data(graph_query, code=report, sourceID=source, fight=fight, dtype=dtype, startTime=startTime, endTime=endTime)
    return jsonify(response)

@app.route('/get_fight_data', methods=['POST'])
def get_fight_data():
    data = request.get_json()
    report = data.get('reportId')
    print(report)
    response = get_api_data(fightReport_query, code=report)
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