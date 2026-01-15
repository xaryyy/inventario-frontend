from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuración de base de datos (SQLite por simplicidad, puedes usar Postgres en producción)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///inventario.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Modelo de producto
class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    cantidad = db.Column(db.Integer, default=0)

# Inicializar base de datos
with app.app_context():
    db.create_all()

# Ruta: obtener inventario completo
@app.route("/inventario", methods=["GET"])
def obtener_inventario():
    productos = Producto.query.all()
    return jsonify([{"nombre": p.nombre, "cantidad": p.cantidad} for p in productos])

# Ruta: agregar producto o sumar stock
@app.route("/agregar", methods=["POST"])
def agregar_producto():
    data = request.json
    nombre = data.get("nombre")
    cantidad = int(data.get("cantidad", 0))

    producto = Producto.query.filter_by(nombre=nombre).first()
    if producto:
        producto.cantidad += cantidad
    else:
        producto = Producto(nombre=nombre, cantidad=cantidad)
        db.session.add(producto)

    db.session.commit()
    return jsonify({"mensaje": "Producto actualizado", "nombre": producto.nombre, "cantidad": producto.cantidad})

# Ruta: retirar producto o descontar stock
@app.route("/retirar", methods=["POST"])
def retirar_producto():
    data = request.json
    nombre = data.get("nombre")
    cantidad = int(data.get("cantidad", 0))

    producto = Producto.query.filter_by(nombre=nombre).first()
    if producto and producto.cantidad >= cantidad:
        producto.cantidad -= cantidad
        if producto.cantidad == 0:
            db.session.delete(producto)
        db.session.commit()
        return jsonify({"mensaje": "Producto retirado", "nombre": nombre, "cantidad": producto.cantidad if producto else 0})
    else:
        return jsonify({"error": "Stock insuficiente o producto no encontrado"}), 400

if __name__ == "__main__":
    app.run(debug=True)