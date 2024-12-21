const express = require('express');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

module.exports = (db) => {
  // Get events by id
  router.get('/api/v3/app/events', async (req, res) => {
    try {
      const { id, type, limit, page } = req.query;

      if (id) {
        const event = await db.collection('events').findOne({ _id: new ObjectId(id) });
        if (event) {
          res.status(200).json(event);
        } else {
          res.status(404).json({ error: 'Event not found' });
        }
        return;
      }

      if (type === 'latest') {
        const events = await db.collection('events')
          .find()
          .sort({ schedule: -1 })
          .skip((parseInt(page) - 1) * parseInt(limit))
          .limit(parseInt(limit))
          .toArray();
        return res.status(200).json(events);
      }

      res.status(400).json({ error: 'Invalid query parameters' });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });

  // Post events
  router.post('/api/v3/app/events', upload.single('files[image]'), async (req, res) => {
    try {
      const { name, tagline, schedule, description, moderator, category, sub_category, rigor_rank } = req.body;
      const event = {
        type: 'event',
        uid: 18,
        name,
        tagline,
        schedule: new Date(schedule),
        description,
        files: { image: req.file?.path },
        moderator,
        category,
        sub_category,
        rigor_rank: parseInt(rigor_rank),
        attendees: [],
      };

      const result = await db.collection('events').insertOne(event);
      res.status(201).json({ id: result.insertedId });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });

  // Put events by id
  router.put('/api/v3/app/events/:id', upload.single('files[image]'), async (req, res) => {
    try {
      const { id } = req.params;
      const { name, tagline, schedule, description, moderator, category, sub_category, rigor_rank } = req.body;
      const updateData = {
        ...(name && { name }),
        ...(tagline && { tagline }),
        ...(schedule && { schedule: new Date(schedule) }),
        ...(description && { description }),
        ...(req.file && { files: { image: req.file.path } }),
        ...(moderator && { moderator }),
        ...(category && { category }),
        ...(sub_category && { sub_category }),
        ...(rigor_rank && { rigor_rank: parseInt(rigor_rank) }),
      };

      const result = await db.collection('events').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount > 0) {
        res.status(200).json({ message: 'Event updated successfully' });
      } else {
        res.status(404).json({ error: 'Event not found' });
      }
      return;      
    } catch (err) {
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });

  // Delete events by id
  router.delete('/api/v3/app/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.collection('events').deleteOne({ _id: new ObjectId(id) });
      
        if (result.deletedCount > 0) {
          res.status(200).json({ message: 'Event deleted successfully' });
        } else {
          res.status(404).json({ error: 'Event not found' });
        }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });

  return router;
};
