import express from 'express';
import multer from 'multer';
import Gem from '../models/gem.model.js';

const gemRouter = express.Router();

// Set up Multer for handling file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add Gem
export const addgem = async (req, res) => {
  try {
    const { name, price, carat, category, color, shortdes, des } = req.body;
    const image = req.file;

    if (!name || !price || !carat || !category || !color || !shortdes || !des || !image) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const newGem = new Gem({
      name,
      price,
      carat,
      category,
      color,
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

// Get All Gems
export const getAllGems = async (req, res) => {
  try {
    const gems = await Gem.find();

    const gemsWithBase64Images = gems.map((gem) => {
      let imageData = null;

      if (gem.image?.data) {
        imageData = {
          contentType: gem.image.contentType,
          data: gem.image.data.toString('base64'),
        };
      }

      return {
        _id: gem._id,
        name: gem.name,
        price: gem.price,
        carat: gem.carat,
        category: gem.category,
        color: gem.color,
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

// Get Gem by ID
export const getGemById = async (req, res) => {
  try {
    const gem = await Gem.findById(req.params.id);
    if (!gem) {
      return res.status(404).json({ message: 'Gem not found' });
    }

    const imageData = gem.image?.data
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
        carat: gem.carat,
        category: gem.category,
        color: gem.color,
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

// Update Gem
export const updateGem = async (req, res) => {
  try {
    const { name, price, carat, category, color, shortdes, des } = req.body;
    const image = req.file;

    if (!name || !price || !carat || !category || !color || !shortdes || !des) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const gem = await Gem.findById(req.params.id);
    if (!gem) {
      return res.status(404).json({ message: 'Gem not found' });
    }

    gem.name = name;
    gem.price = price;
    gem.carat = carat;
    gem.category = category;
    gem.color = color;
    gem.shortdes = shortdes;
    gem.des = des;

    if (image) {
      gem.image = {
        data: image.buffer,
        contentType: image.mimetype,
      };
    }

    await gem.save();

    const imageData = gem.image?.data
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
        carat: gem.carat,
        category: gem.category,
        color: gem.color,
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

// Delete Gem
export const deleteGem = async (req, res) => {
  try {
    const gem = await Gem.findById(req.params.id);
    if (!gem) {
      return res.status(404).json({ message: 'Gem not found' });
    }

    const imageData = gem.image?.data
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
        carat: gem.carat,
        category: gem.category,
        color: gem.color,
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

// Routes
gemRouter.post('/', upload.single('image'), addgem);
gemRouter.get('/', getAllGems);
gemRouter.get('/:id', getGemById);
gemRouter.put('/:id', upload.single('image'), updateGem);
gemRouter.delete('/:id', deleteGem);

export default gemRouter;
