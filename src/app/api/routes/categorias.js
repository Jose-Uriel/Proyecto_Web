// api/routes/categorias.js
const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db'); // Asegúrate de que la ruta sea correcta

// Obtener todas las categorías
router.get('/', async (req, res) => 
{
  try 
  {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Categories');
    res.json(result.recordset);
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

// Obtener una categoría por ID
router.get('/:id', async (req, res) => {
  try 
  {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Categories WHERE CategoryID = @id');
    res.json(result.recordset[0]);
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

// Crear una nueva categoría
router.post('/', async (req, res) => 
{
  const { CategoryName, Description } = req.body;
  try 
  {
    const pool = await poolPromise;
    await pool.request()
      .input('CategoryName', sql.NVarChar, CategoryName)
      .input('Description', sql.NVarChar, Description)
      .query(`INSERT INTO Categories (CategoryName, Description)
              VALUES (@CategoryName, @Description)`);
    res.status(201).send('Categoría creada');
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

// Actualizar una categoría
router.put('/:id', async (req, res) => 
{
  const { CategoryName, Description } = req.body;
  try 
  {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('CategoryName', sql.NVarChar, CategoryName)
      .input('Description', sql.NVarChar, Description)
      .query(`UPDATE Categories 
              SET CategoryName = @CategoryName, Description = @Description
              WHERE CategoryID = @id`);
    res.send('Categoría actualizada');
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

// Eliminar una categoría
router.delete('/:id', async (req, res) => 
{
  try 
  {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Categories WHERE CategoryID = @id');
    res.send('Categoría eliminada');
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

module.exports = router;
