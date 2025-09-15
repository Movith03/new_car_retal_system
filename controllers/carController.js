const Car = require('../models/Car');
const db = require("../config/database")

exports.getAllCars = async (req, res) => {
  try {
    const { type, search, sort } = req.query;
    const filters = { type, search, sort };

    const cars = await Car.findAll(filters);

    const carsWithImage = cars.map(car => ({
      ...car,
      img: car.image_url
        ? `${req.protocol}://${req.get('host')}/uploads/${car.image_url}`
        : null
    }));

    res.json(carsWithImage);
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ message: 'Server error while fetching cars' });
  }
};

exports.getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    car.img = car.image_url
      ? `${req.protocol}://${req.get('host')}/uploads/${car.image_url}`
      : null;

    res.json(car);
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({ message: 'Server error while fetching car' });
  }
};


exports.addCar = (req, res) => {
  const {
    brand,
    model,
    year,
    type,
    seats,
    transmission,
    fuel,
    price_per_day,
    description,
  } = req.body;

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const name = `${brand} ${model}`;

  const sql = `
    INSERT INTO cars 
      (name, brand, year, type, seats, transmission, fuel, price_per_day, description, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    brand,
    year,
    type,
    seats,
    transmission,
    fuel,
    price_per_day,
    description,
    imageUrl,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error adding car:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.status(201).json({
      success: true,
      id: result.insertId,
      imageUrl,
      message: "Car added successfully",
    });
  });
};