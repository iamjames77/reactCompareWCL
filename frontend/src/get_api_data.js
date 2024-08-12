export function get_data(reportID, fight, source, startTime, endTime) {
    return fetch('/get_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportID, fight, source, startTime, endTime }),
    })
      .then(response => response.json())
      .then(data => {
        return data;
      }
      )
      .catch(err => console.error('Error fetching data'));
}

export function get_fight_options(reportID) {
    return fetch('/get_fight_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportID }),
    })
      .then(response => response.json())
      .then(data => {
        return data;
      }
      )
      .catch(err => console.error('Error fetching data'));
}

export function get_player_data(reportID, fight) {
    return fetch('/get_player_details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportID, fight }),
    })
      .then(response => response.json())
      .then(data => {
        return data;
      }
      )
      .catch(err => console.error('Error fetching data'));
}

export function get_graph_data(reportID, fight, source, target, type, startTime, endTime) {
    return fetch('/get_graph_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportID, fight, source, target, type, startTime, endTime }),
    })
      .then(response => response.json())
      .then(data => {
        return data;
      }
      )
      .catch(err => console.error('Error fetching data'));
}

export function get_fight_data_with_encounterID(reportID, encounterID) {
    return fetch('/get_fight_data_with_encounterID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportID, encounterID }),
    })
      .then(response => response.json())
      .then(data => {
        return data;
      }
      )
      .catch(err => console.error('Error fetching data'));
}

export function get_phase_info(reportID) {
    return fetch('/get_phase_info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportID }),
    })
      .then(response => response.json())
      .then(data => {
        return data;
      }
      )
      .catch(err => console.error('Error fetching data'));
}

function splitByKey(data, key) {
  const result = {};
  const keySet = new Set();

  data.forEach(item => {
      const keyValue = item[key];
      if (item.difficulty === null){
        return;
      }

      if (!result[keyValue]) {
          result[keyValue] = [];
      }
      result[keyValue].push(item);
      keySet.add(keyValue);
  });

  return { groupedData: result, keyList: Array.from(keySet) };
}

export function getKeyOptions(data, key){
  const {groupedData, keyList} = splitByKey(data, key);
  const keyOptions = keyList.map(key => {
    return {
      value: JSON.stringify(groupedData[key]),
      text: key,
    }
  });
  return keyOptions;
}

export function get_friendly_data(reportID, fight) {
  return fetch('/get_friendly_data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportID, fight }),
  })
    .then(response => response.json())
    .then(data => {
      return data;
    }
    )
    .catch(err => console.error('Error fetching data'));
}

export function get_enemy_data(reportID, fight) {
  return fetch('/get_enemy_data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportID, fight }),
  })
    .then(response => response.json())
    .then(data => {
      return data;
    }
    )
    .catch(err => console.error('Error fetching data'));
}

export function get_master_data(reportID){
  return fetch('/get_master_data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportID }),
  })
    .then(response => response.json())
    .then(data => {
      return data;
    }
    )
    .catch(err => console.error('Error fetching data'));
}

export function get_table_data(reportID, fight, source, target, startTime, endTime){
  return fetch('/get_table_data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportID, fight, source, target, startTime, endTime }),
  })
    .then(response => response.json())
    .then(data => {
      return data;
    }
    )
    .catch(err => console.error('Error fetching data'));
}

export function get_hostility_table_data(reportID, fight, source, startTime, endTime){
  return fetch('/get_hostility_table_data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportID, fight, source, startTime, endTime }),
  })
    .then(response => response.json())
    .then(data => {
      return data;
    }
    )
    .catch(err => console.error('Error fetching data'));
}