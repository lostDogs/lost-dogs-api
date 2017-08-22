echo 'Installing dependencies';
npm i --only=prod

echo 'Starting API';
pm2-docker process.yml