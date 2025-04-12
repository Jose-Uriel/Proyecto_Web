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

// Crear un nuevo producto
router.post('/', async (req, res) => 
{
  const { CategoryID, Name, Price, Description, Stock } = req.body;
  try 
  {
    const pool = await poolPromise;
    await pool.request()
      .input('CategoryID', sql.Int, CategoryID)
      .input('Name', sql.NVarChar, Name)
      .input('Price', sql.Decimal(10, 2), Price)
      .input('Description', sql.NVarChar, Description)
      .input('Stock', sql.Int, Stock)
      .query(`INSERT INTO Products (CategoryID, Name, Price, Description, Stock)
              VALUES (@CategoryID, @Name, @Price, @Description, @Stock)`);
    res.status(201).send('Producto creado');
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
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
    res.send('Producto actualizado');
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
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
    res.send('Producto eliminado');
  } catch (err) {
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

module.exports = router;
