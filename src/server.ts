import express from 'express';

const app = express();

app.get('/ads', (req, res) => {
  return res.json([
    {id: 1, name: 'William', age: 19},
    {id: 2, name: 'Carlos', age: 51},
    {id: 3, name: 'Patricia', age: 50}
  ]);
});

app.listen(3333, () => {
  console.log('Its listening on 3333 port');
});