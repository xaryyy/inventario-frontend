import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Usamos la variable de entorno
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
    // Registrar movimiento
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
        copia[idx].cantidad = Math.max(0, copia[idx].cantidad - parseInt(cantidad));
        return copia;
      }
      return prev;
    });
    // Registrar movimiento
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
    <div style={{ padding: "2rem", maxWidth: 800 }}>
      <h1>Inventario</h1>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={e => setCantidad(e.target.value)}
        />
        <button onClick={agregar}>Agregar</button>
        <button onClick={retirar}>Retirar</button>
      </div>

      <h2>Stock actual</h2>
      <ul>
        {inventario.map((item, i) => (
          <li key={i}>{item.nombre} — {item.cantidad}</li>
        ))}
      </ul>

      <h2>Movimientos</h2>
      <table border="1" style={{ width: "100%", marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m, i) => (
            <tr key={i}>
              <td>{m.tipo}</td>
              <td>{m.nombre}</td>
              <td>{m.cantidad}</td>
              <td>{m.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={exportarExcel} style={{ marginTop: "1rem" }}>
        Exportar a Excel
      </button>
    </div>
  );
}

export default App;