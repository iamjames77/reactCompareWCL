export function get_data(reportID, fight, source) {
    return fetch('/get_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportID, fight, source }),
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

export function get_graph_data(reportID, fight, source, type, startTime, endTime) {
    return fetch('/get_graph_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportID, fight, source, type, startTime, endTime }),
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