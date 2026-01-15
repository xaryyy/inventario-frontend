import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://JavierM22.pythonanywhere.com";

function App() {
  const [inventario, setInventario] = useState([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");

  useEffect(() => {
    axios.get(`${API}/inventario`).then(res => setInventario(res.data));
  }, []);

  const agregar = async () => {
    if (!nombre || !cantidad) return;
    await axios.post(`${API}/agregar`, {
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
    setNombre("");
    setCantidad("");
  };

  const retirar = async () => {
    if (!nombre || !cantidad) return;
    await axios.post(`${API}/retirar`, {
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
    setNombre("");
    setCantidad("");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 600 }}>
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

      <ul>
        {inventario.map((item, i) => (
          <li key={i}>{item.nombre} — {item.cantidad}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;