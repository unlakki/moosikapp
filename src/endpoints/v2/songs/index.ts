/* eslint-disable no-bitwise */

import { Response } from 'express';
import { AuthorizedRequest, SongData } from '../../../../typings';
import upload from './upload';
import * as DB from '../../../apis/mongodb/songs';
import { getUserByUuid } from '../../../apis/mongodb/users';

import { scopes, roles } from '../../../config.json';

const { CDN_SERVER } = process.env;

export function getSongs() {
  return async (req: AuthorizedRequest, res: Response): Promise<void> => {
    const { skip, limit, scope } = req.query;

    if (skip < 0) {
      res.status(400).send({ message: 'Invalid query parameter `skip` provided.' });
      return;
    }

    if (limit < 1 || limit > 100) {
      res.status(400).send({ message: 'Invalid query parameter `limit` provided.' });
      return;
    }

    const user = req.jwt.uuid;

    try {
      const result = await DB.getSongs(Number(skip), Number(limit));

      if (!result.length) {
        res.status(404).send({ message: 'No songs found.' });
        return;
      }

      const songs: Array<SongData> = [];

      result.forEach((song) => {
        const {
          uuid, author, title, cover, likes, uploadedBy,
        } = song;

        const isFav = likes.includes(user);
        const canEdit = uploadedBy === user || req.jwt.role >= roles.moderator;

        songs.push({
          uuid,
          author,
          title,
          cover,
          favorite: scope & scopes.favorite ? isFav : undefined,
          edit: scope & scopes.edit ? canEdit : undefined,
        } as SongData);
      });

      res.status(200).send({ message: 'Successfully retrieved songs.', songs });
    } catch (e) {
      res.status(500).send({ message: 'Internal server error.' });
    }
  };
}

export function getSongByUuid() {
  return async (req: AuthorizedRequest, res: Response): Promise<void> => {
    try {
      const song = await DB.getSongByUuid(req.params.songId);

      if (!song) {
        res.status(404).send({ message: 'No song found.' });
        return;
      }

      const user = req.jwt.uuid;

      const foundedUser = await getUserByUuid(song.uploadedBy);
      
      if (!foundedUser) {
        res.status(500).send({ message: 'Something went wrong.' });
        return;
      }

      const { username } = foundedUser;

      const {
        uuid, author, title, cover, path, uploadedBy, createdAt, likes,
      } = song;

      res.status(200).send({
        message: 'Successfully retrieved song.',
        song: {
          uuid,
          author,
          title,
          cover,
          url: `${CDN_SERVER}${path}`,
          uploadedBy: username,
          createdAt,
          favorite: likes.includes(user),
          edit: uploadedBy === user,
        },
      });
    } catch (e) {
      res.status(500).send({ message: 'Internal server error.' });
    }
  };
}

export function findSongs() {
  return async (req: AuthorizedRequest, res: Response): Promise<void> => {
    const {
      query, skip, limit, scope,
    } = req.query;

    if (!query) {
      res.status(400).send({ message: 'No query provided.' });
      return;
    }

    if (skip < 0) {
      res.status(400).send({ message: 'Invalid query parameter `skip` provided.' });
      return;
    }

    if (limit < 1 || limit > 100) {
      res.status(400).send({ message: 'Invalid query parameter `limit` provided.' });
      return;
    }

    const user = req.jwt.uuid;

    try {
      const result = await DB.findSongs(decodeURI(query), Number(skip), Number(limit));

      if (!result.length) {
        res.status(404).send({ message: 'No songs found.' });
        return;
      }

      const songs: Array<SongData> = [];

      result.forEach((song) => {
        const {
          uuid, author, title, cover, likes, uploadedBy,
        } = song.toJSON();

        const isFav = likes.includes(user);
        const canEdit = uploadedBy === user || req.jwt.role >= roles.moderator;

        songs.push({
          uuid,
          author,
          title,
          cover,
          favorite: scope & scopes.favorite ? isFav : undefined,
          edit: scope & scopes.edit ? canEdit : undefined,
        } as SongData);
      });

      res.status(200).send({ message: 'Successfully retrieved songs.', songs });
    } catch (e) {
      res.status(500).send({ message: 'Internal server error.' });
    }
  };
}

export function uploadSong() {
  return (req: AuthorizedRequest, res: Response): void => {
    if (!req.body || Number(req.headers['content-length']) === 0) {
      res.status(400).send({ message: 'No body provided.' });
      return;
    }

    upload(req, res);
  };
}

export function updateSong() {
  return async (req: AuthorizedRequest, res: Response): Promise<void> => {
    const { body, params: { songId } } = req;

    if (!body) {
      res.status(400).send({ message: 'No body provided.' });
      return;
    }

    const { uuid, role } = req.jwt;

    const foundedSong = await DB.getSongByUuid(songId);

    if (!foundedSong) {
      res.status(404).send({ message: 'No song found.' });
      return;
    }

    if (foundedSong.uploadedBy !== uuid && role < roles.moderator) {
      res.status(403).send({ message: 'Forbitten.' });
      return;
    }

    const song: any = {}; // eslint-disable-line
    Object.keys(body).forEach((key) => {
      if (['author', 'title', 'cover'].includes(key)) {
        song[key] = body[key].trim();
      }
    });

    try {
      await DB.updateSong(songId, song);
      res.status(200).send({ message: 'Successfully updated song.', song });
    } catch (e) {
      res.status(500).send({ message: 'Internal server error.' });
    }
  };
}

export function deleteSong() {
  return async (req: AuthorizedRequest, res: Response): Promise<void> => {
    try {
      const { songId } = req.params;

      const { uuid, role } = req.jwt;

      const foundedSong = await DB.getSongByUuid(songId);

      if (!foundedSong) {
        res.status(404).send({ message: 'No song found.' });
        return;
      }

      if (foundedSong.uploadedBy !== uuid && role < roles.moderator) {
        res.status(403).send({ message: 'Forbitten.' });
        return;
      }

      await DB.deleteSong(songId);

      res.status(204).send();
    } catch (e) {
      res.status(500).send({ message: 'Internal server error.' });
    }
  };
}