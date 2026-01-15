import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  Container,
  Stack
} from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [inventario, setInventario] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/inventario`)
      .then(res => setInventario(res.data))
      .catch(err => console.error("Error cargando inventario:", err));
  }, []);

  const agregar = async () => {
    if (!nombre || !cantidad) return;
    await axios.post(`${API_URL}/agregar`, {
      nombre,
      cantidad: parseInt(cantidad)
    });
    setInventario(prev => {
      const idx = prev.findIndex(i => i.nombre === nombre);
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx].cantidad += parseInt(cantidad);
        return copia;
      }
      return [...prev, { nombre, cantidad: parseInt(cantidad) }];
    });
    setMovimientos(prev => [
      ...prev,
      { tipo: "Ingreso", nombre, cantidad: parseInt(cantidad), fecha: new Date().toLocaleString() }
    ]);
    setNombre("");
    setCantidad("");
  };

  const retirar = async () => {
    if (!nombre || !cantidad) return;
    await axios.post(`${API_URL}/retirar`, {
      nombre,
      cantidad: parseInt(cantidad)
    });
    setInventario(prev => {
      const idx = prev.findIndex(i => i.nombre === nombre);
      if (idx >= 0) {
        const copia = [...prev];
        const nuevaCantidad = copia[idx].cantidad - parseInt(cantidad);
        if (nuevaCantidad <= 0) {
          copia.splice(idx, 1); // elimina el producto si llega a 0
        } else {
          copia[idx].cantidad = nuevaCantidad;
        }
        return copia;
      }
      return prev;
    });
    setMovimientos(prev => [
      ...prev,
      { tipo: "Egreso", nombre, cantidad: parseInt(cantidad), fecha: new Date().toLocaleString() }
    ]);
    setNombre("");
    setCantidad("");
  };

  const exportarExcel = () => {
    const hoja = XLSX.utils.json_to_sheet(movimientos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Movimientos");
    const excelBuffer = XLSX.write(libro, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "movimientos_inventario.xlsx");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Inventario</Typography>

      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          label="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
        <TextField
          type="number"
          label="Cantidad"
          value={cantidad}
          onChange={e => setCantidad(e.target.value)}
        />
        <Button variant="contained" color="success" onClick={agregar}>Agregar</Button>
        <Button variant="contained" color="error" onClick={retirar}>Retirar</Button>
      </Stack>

      <Typography variant="h6">Stock actual</Typography>
      <ul>
        {inventario.map((item, i) => (
          <li key={i}>{item.nombre} — {item.cantidad}</li>
        ))}
      </ul>

      <Typography variant="h6" sx={{ mt: 3 }}>Movimientos</Typography>
      <Paper sx={{ mt: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimientos.map((m, i) => (
              <TableRow key={i}>
                <TableCell>{m.tipo}</TableCell>
                <TableCell>{m.nombre}</TableCell>
                <TableCell>{m.cantidad}</TableCell>
                <TableCell>{m.fecha}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Button variant="outlined" sx={{ mt: 2 }} onClick={exportarExcel}>
        Exportar a Excel
      </Button>
    </Container>
  );
}

export default App;