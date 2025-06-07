// api/routes/productos.js
const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// Obtener todos los productos
router.get('/', async (req, res) => 
{
	try 
	{
    	const pool = await poolPromise;
	 	const result = await pool.request().query('SELECT * FROM Products');
		res.json(result.recordset);
	} 
	catch (err) 
	{
		res.status(500).send(err.message);
	}
});

// Crear un nuevo producto
router.post('/', async (req, res) => 
{
  const { ProductID, CategoryID, Name, Price, Description, Stock, Image } = req.body;
  try 
  {
    const pool = await poolPromise;
    await pool.request()
      .input('ProductID', sql.Int, ProductID)
      .input('CategoryID', sql.Int, CategoryID)
      .input('Name', sql.NVarChar, Name)
      .input('Price', sql.Decimal(10, 2), Price)
      .input('Description', sql.NVarChar, Description)
      .input('Stock', sql.Int, Stock)
      .input('Image', sql.NVarChar, Image || null)
      .query(`INSERT INTO Products (ProductID, CategoryID, Name, Price, Description, Stock, Image)
              VALUES (@ProductID, @CategoryID, @Name, @Price, @Description, @Stock, @Image)`);
    res.status(201).json({ message: 'Producto creado' }); // Changed from send() to json()
  } 
  catch (err) 
  {
    res.status(500).json({ error: err.message }); // Also update this to json()
  }
});

// Actualizar un producto
router.put('/:id', async (req, res) => 
{
  const id = req.params.id;
  const { CategoryID, Name, Price, Description, Stock } = req.body;
  try 
  {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('CategoryID', sql.Int, CategoryID)
      .input('Name', sql.NVarChar, Name)
      .input('Price', sql.Decimal(10, 2), Price)
      .input('Description', sql.NVarChar, Description)
      .input('Stock', sql.Int, Stock)
      .query(`UPDATE Products SET 
                CategoryID = @CategoryID,
                Name = @Name,
                Price = @Price,
                Description = @Description,
                Stock = @Stock
              WHERE ProductID = @id`);
    res.json({ message: 'Producto actualizado' }); // Changed from send()
  } 
  catch (err) 
  {
    res.status(500).json({ error: err.message }); // Changed from send()
  }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => 
{
  const id = req.params.id;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Products WHERE ProductID = @id');
    res.json({ message: 'Producto eliminado' }); // Changed from send()
  } catch (err) {
    res.status(500).json({ error: err.message }); // Changed from send()
  }
});

// Mover estas rutas especiales ANTES de la ruta /:id

// Obtener productos en stock
router.get('/instock', async (req, res) => 
{
  try 
  {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Products WHERE Stock > 0');
    res.json(result.recordset);
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

// Buscar productos por nombre
router.get('/search/:name', async (req, res) => 
{
  const name = req.params.name;
  try 
  {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('name', sql.NVarChar, `%${name}%`)
      .query('SELECT * FROM Products WHERE Name LIKE @name');
    res.json(result.recordset);
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

// Obtener productos por categoría
router.get('/category/:id', async (req, res) => 
{
  const id = req.params.id;
  try 
  {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Products WHERE CategoryID = @id');
    res.json(result.recordset);
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

// Obtener productos por rango de precio
router.get('/price/:min/:max', async (req, res) => 
{
    const min = req.params.min;
    const max = req.params.max;
    try 
    {
        const pool = await poolPromise;
        const result = await pool.request()
        .input('min', sql.Decimal(10, 2), min)
        .input('max', sql.Decimal(10, 2), max)
        .query('SELECT * FROM Products WHERE Price BETWEEN @min AND @max');
        res.json(result.recordset);
    } 
    catch (err) 
    {
        res.status(500).send(err.message);
    }
});

// Después de todas las rutas especiales, define la ruta con el parámetro
// Obtener un producto por ID
router.get('/:id', async (req, res) => 
{
  const id = req.params.id;
  try 
  {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Products WHERE ProductID = @id');
    res.json(result.recordset[0]);
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

module.exports = router;
