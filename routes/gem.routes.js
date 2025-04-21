import express from 'express';
import multer from 'multer';
import Gem from '../models/gem.model.js';  // Assuming Gem model is defined
const gemRouter = express.Router();

// Set up Multer for handling file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define the addgem controller
export const addgem = async (req, res) => {
  try {
    const { name, price, carot, shortdes, des } = req.body;
    const image = req.file;

    if (!name || !price || !carot || !shortdes || !des || !image) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const newGem = new Gem({
      name,
      price,
      carot,
      shortdes,
      des,
      image: {
        data: image.buffer,
        contentType: image.mimetype
      }
    });

    await newGem.save();
    res.status(201).json({ message: 'Gem created successfully', gem: newGem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Define the getAllGems controller
export const getAllGems = async (req, res) => {
  try {
    const gems = await Gem.find();

    const gemsWithBase64Images = gems.map((gem) => {
      let imageData = null;

      if (gem.image && gem.image.data) {
        imageData = {
          contentType: gem.image.contentType,
          data: gem.image.data.toString('base64'),
        };
      }

      return {
        _id: gem._id,
        name: gem.name,
        price: gem.price,
        carot: gem.carot,
        shortdes: gem.shortdes,
        des: gem.des,
        image: imageData,
      };
    });

    res.status(200).json({ gems: gemsWithBase64Images });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Define the getGemById controller
export const getGemById = async (req, res) => {
  try {
    const gem = await Gem.findById(req.params.id);
    if (!gem) {
      return res.status(404).json({ message: 'Gem not found' });
    }

    const imageData = gem.image && gem.image.data
      ? {
          contentType: gem.image.contentType,
          data: gem.image.data.toString('base64'),
        }
      : null;

    res.status(200).json({
      gem: {
        _id: gem._id,
        name: gem.name,
        price: gem.price,
        carot: gem.carot,
        shortdes: gem.shortdes,
        des: gem.des,
        image: imageData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Define the updateGem controller (with file upload)
export const updateGem = async (req, res) => {
  try {
    const { name, price, carot, shortdes, des } = req.body;
    const image = req.file;

    if (!name || !price || !carot || !shortdes || !des) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const gem = await Gem.findById(req.params.id);
    if (!gem) {
      return res.status(404).json({ message: 'Gem not found' });
    }

    gem.name = name;
    gem.price = price;
    gem.carot = carot;
    gem.shortdes = shortdes;
    gem.des = des;

    if (image) {
      gem.image = {
        data: image.buffer,
        contentType: image.mimetype,
      };
    }

    await gem.save();

    const imageData = gem.image && gem.image.data
      ? {
          contentType: gem.image.contentType,
          data: gem.image.data.toString('base64'),
        }
      : null;

    res.status(200).json({
      message: 'Gem updated successfully',
      gem: {
        _id: gem._id,
        name: gem.name,
        price: gem.price,
        carot: gem.carot,
        shortdes: gem.shortdes,
        des: gem.des,
        image: imageData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Define the deleteGem controller
export const deleteGem = async (req, res) => {
  try {
    const gem = await Gem.findById(req.params.id);
    if (!gem) {
      return res.status(404).json({ message: 'Gem not found' });
    }

    const imageData = gem.image && gem.image.data
      ? {
          contentType: gem.image.contentType,
          data: gem.image.data.toString('base64'),
        }
      : null;

    await gem.deleteOne();

    res.status(200).json({
      message: 'Gem deleted successfully',
      deletedGem: {
        _id: gem._id,
        name: gem.name,
        price: gem.price,
        carot: gem.carot,
        shortdes: gem.shortdes,
        des: gem.des,
        image: imageData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Use the controllers in your router
gemRouter.post('/', upload.single('image'), addgem);
gemRouter.get('/', getAllGems);
gemRouter.get('/:id', getGemById);
gemRouter.put('/:id', upload.single('image'), updateGem);
gemRouter.delete('/:id', deleteGem);

export default gemRouter;
