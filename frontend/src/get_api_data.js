export function get_data(reportId, fight, source) {
  console.log(reportId, fight, source);
    return fetch('/get_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportId, fight, source }),
    })
      .then(response => response.json())
      .then(data => {
        return data;
      }
      )
      .catch(err => console.error('Error fetching data'));
}

export function get_fight_options(reportId) {
    return fetch('/get_fight_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportId }),
    })
      .then(response => response.json())
      .then(data => {
        return data;
      }
      )
      .catch(err => console.error('Error fetching data'));
}

export function get_player_data(reportId, fight) {
    return fetch('/get_player_details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportId, fight }),
    })
      .then(response => response.json())
      .then(data => {
        return data;
      }
      )
      .catch(err => console.error('Error fetching data'));
}