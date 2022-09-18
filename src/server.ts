import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ConvertHourStringToMinutes } from './utils/convert-hour-string-to-minutes';
import { ConvertMinuteToHourString } from './utils/convert-minute-to-hour-string';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

const prisma = new PrismaClient({
  log: ['query']
});

app.get('/games', async (req, res) => {

  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        }
      }
    }
  });

  return res.json(games);
});

app.get('/games/:id/ads', async (req, res) => {
  const gameId : string = req.params.id;
  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true
    },
    where: {
      gameId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return res.json(ads.map(ad => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: ConvertMinuteToHourString(ad.hourStart),
      hourEnd: ConvertMinuteToHourString(ad.hourEnd),
    }
  }));
});

app.get('/ads/:id/discord', async (req, res) => {
  const adId = req.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    }
  })
  
  return res.json({
    discord: ad.discord,
  });
});

app.post('/games/:id/ads', async (req, res) => {
  const gameId : string = req.params.id;
  const body = req.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      hourStart: ConvertHourStringToMinutes(body.hourStart),
      hourEnd: ConvertHourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,
    }
  });


  return res.status(201).json(ad);
});  

app.listen(3333, () => {
  console.log('Its listening on 3333 port');
});