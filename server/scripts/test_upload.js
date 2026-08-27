import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function main(){
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:'mailtrap-test-1785254228389@example.com', password:'Example1A'})});
  const loginJson = await loginRes.json();
  const token = loginJson.data.accessToken;

  const form = new FormData();
  form.append('resume', fs.createReadStream('./test-resume.pdf'));
  form.append('uploadSource','web');

  const res = await fetch('http://localhost:5000/api/v1/resumes/upload',{
    method: 'POST',
    headers: { Authorization: 'Bearer '+token, ...form.getHeaders() },
    body: form
  });
  console.log('status', res.status);
  console.log(await res.text());
}

main().catch(console.error);
