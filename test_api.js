const http = require('http');

const payload = JSON.stringify({
  username: process.env.TEST_USERNAME,
  password: process.env.TEST_PASSWORD
});

const req = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log("LOGIN:", res.statusCode, data);
    const token = JSON.parse(data).token;
    
    // Test POST
    const postPayload = JSON.stringify({ name: "Curl Habit", pillar_id: null, target_per_week: 5 });
    const postReq = http.request({
      hostname: 'localhost', port: 5001, path: '/api/habits', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': postPayload.length, 'Authorization': 'Bearer ' + token }
    }, (postRes) => {
      let postData = '';
      postRes.on('data', (c) => postData += c);
      postRes.on('end', () => console.log("POST HABIT:", postRes.statusCode, postData));
    });
    postReq.write(postPayload);
    postReq.end();
    
    // Test PUT
    const putPayload = JSON.stringify({ name: "Curl Habit Updated", pillar_id: null, target_per_week: 7 });
    const putReq = http.request({
      hostname: 'localhost', port: 5001, path: '/api/habits/1', method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Content-Length': putPayload.length, 'Authorization': 'Bearer ' + token }
    }, (putRes) => {
      let putData = '';
      putRes.on('data', (c) => putData += c);
      putRes.on('end', () => console.log("PUT HABIT 1:", putRes.statusCode, putData));
    });
    putReq.write(putPayload);
    putReq.end();
  });
});
req.write(payload);
req.end();
