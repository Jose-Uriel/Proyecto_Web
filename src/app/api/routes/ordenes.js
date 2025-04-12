// api/routes/ordenes.js
const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// Obtener todas las órdenes
router.get('/', async (req, res) => 
{
  try 
  {
	const pool = await poolPromise;
	const result = await pool.request().query('SELECT * FROM Orders');
	res.json(result.recordset);
  } 
  catch (err) 
  {
	res.status(500).send(err.message);
  }
});

// Obtener una orden por ID
router.get('/:id', async (req, res) => 
{
  try 
  {
	const pool = await poolPromise;
	const result = await pool.request()
	  .input('id', sql.Int, req.params.id)
	  .query('SELECT * FROM Orders WHERE OrderID = @id');
	res.json(result.recordset[0]);
  } 
  catch (err) 
  {
	res.status(500).send(err.message);
  }
});

// Crear una nueva orden
router.post('/', async (req, res) =>
{
  const { UserID, TotalAmount, Status } = req.body;
  // Nota: OrderDate se establece de forma predeterminada en la base (GETDATE())
  try 
  {
	const pool = await poolPromise;
	await pool.request()
	  .input('UserID', sql.Int, UserID)
	  .input('TotalAmount', sql.Decimal(10, 2), TotalAmount)
	  .input('Status', sql.NVarChar, Status)
	  .query(`INSERT INTO Orders (UserID, TotalAmount, Status)
			  VALUES (@UserID, @TotalAmount, @Status)`);
	res.status(201).send('Orden creada');
  } 
  catch (err) 
  {
	res.status(500).send(err.message);
  }
});

// Actualizar una orden
router.put('/:id', async (req, res) => 
{
  const { UserID, TotalAmount, Status } = req.body;
  try 
  {
	const pool = await poolPromise;
	await pool.request()
	  .input('id', sql.Int, req.params.id)
	  .input('UserID', sql.Int, UserID)
	  .input('TotalAmount', sql.Decimal(10, 2), TotalAmount)
	  .input('Status', sql.NVarChar, Status)
	  .query(`UPDATE Orders 
			  SET UserID = @UserID, TotalAmount = @TotalAmount, Status = @Status
			  WHERE OrderID = @id`);
	res.send('Orden actualizada');
  } 
  catch (err) 
  {
	res.status(500).send(err.message);
  }
});

// Eliminar una orden
router.delete('/:id', async (req, res) => 
{
  try 
  {
	const pool = await poolPromise;
	await pool.request()
	  .input('id', sql.Int, req.params.id)
	  .query('DELETE FROM Orders WHERE OrderID = @id');
	res.send('Orden eliminada');
  } 
  catch (err) 
  {
	res.status(500).send(err.message);
  }
});

module.exports = router;
