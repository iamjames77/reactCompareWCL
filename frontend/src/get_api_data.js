export function get_data(reportId, fight, type, source) {
    return fetch('/get_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportId, fight, type, source }),
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