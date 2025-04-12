import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private inventario = new BehaviorSubject<Producto[]>([]);
  public inventario$ = this.inventario.asObservable();
  private apiURL = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {
    this.cargarProductosDesdeAPI();
  }

  private cargarProductosDesdeAPI(): void {
    this.http.get<any[]>(this.apiURL).subscribe({
      next: (data) => {
        const productos = data.map(item => ({
          id: item.ProductID,
          nombre: item.Name,
          precio: item.Price,
          cantidad: item.Stock,
          imagen: item.Image || 'assets/Portatil/Nintendo/3DS/3DS/Normales/3DS.jpg'
        }));
        this.inventario.next(productos);
        console.log('Inventario cargado desde API:', productos);
      },
      error: (error) => {
        console.error('Error al cargar inventario desde API:', error);
      }
    });
  }

  obtenerInventarioCompleto(): Producto[] {
    return this.inventario.value;
  }

  verificarDisponibilidad(id: number): boolean {
    const productos = this.inventario.value;
    const producto = productos.find(p => p.id === id);
    return producto ? producto.cantidad > 0 : false;
  }

  reducirStock(id: number, cantidad: number): boolean {
    const productos = this.inventario.value;
    const producto = productos.find(p => p.id === id);
    
    if (!producto || producto.cantidad < cantidad) {
      return false;
    }
    
    producto.cantidad -= cantidad;
    this.inventario.next([...productos]);
    return true;
  }

  aumentarStock(id: number, cantidad: number): void {
    const productos = this.inventario.value;
    const producto = productos.find(p => p.id === id);
    
    if (producto) {
      producto.cantidad += cantidad;
      this.inventario.next([...productos]);
    }
  }

  actualizarProducto(producto: Producto): void {
    const productos = this.inventario.value;
    const index = productos.findIndex(p => p.id === producto.id);
    
    if (index !== -1) {
      productos[index] = { ...producto };
      this.inventario.next([...productos]);
      
      this.http.put(`${this.apiURL}/${producto.id}`, {
        ProductID: producto.id,
        Name: producto.nombre,
        Price: producto.precio,
        Stock: producto.cantidad,
        Image: producto.imagen
      }).subscribe({
        next: () => console.log('Producto actualizado en el servidor'),
        error: (err) => console.error('Error al actualizar producto en el servidor', err)
      });
    }
  }

  agregarProducto(producto: Producto): void {
    const productos = this.inventario.value;
    
    if (productos.some(p => p.id === producto.id)) {
      alert('Ya existe un producto con ese ID');
      return;
    }
    
    productos.push({ ...producto });
    this.inventario.next([...productos]);
    
    this.http.post(this.apiURL, {
      ProductID: producto.id,
      Name: producto.nombre,
      Price: producto.precio,
      Stock: producto.cantidad,
      Image: producto.imagen,
      CategoryID: 1
    }).subscribe({
      next: () => console.log('Producto agregado en el servidor'),
      error: (err) => console.error('Error al agregar producto en el servidor', err)
    });
  }

  eliminarProducto(id: number): void {
    const productos = this.inventario.value;
    const nuevoInventario = productos.filter(p => p.id !== id);
    this.inventario.next(nuevoInventario);
    
    this.http.delete(`${this.apiURL}/${id}`).subscribe({
      next: () => console.log('Producto eliminado del servidor'),
      error: (err) => console.error('Error al eliminar producto del servidor', err)
    });
  }

  descargar_XML(): void {
    const productos = this.inventario.value;
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<inventario>\n';
    
    productos.forEach(producto => {
      xml += '  <producto>\n';
      xml += `    <id>${producto.id}</id>\n`;
      xml += `    <nombre>${producto.nombre}</nombre>\n`;
      xml += `    <precio>${producto.precio}</precio>\n`;
      xml += `    <cantidad>${producto.cantidad}</cantidad>\n`;
      xml += `    <imagen>${producto.imagen}</imagen>\n`;
      xml += '  </producto>\n';
    });
    
    xml += '</inventario>';
    
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventario.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}