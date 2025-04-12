import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InventarioService } from './inventario.service';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private productosCarrito = new BehaviorSubject<any[]>([]);
  // Rename to match what carrito.component.ts expects
  public productos$ = this.productosCarrito.asObservable();

  constructor(private inventarioService: InventarioService) {}

  agregar_Producto(producto: any): boolean {
    console.log('Agregando producto al carrito:', producto);
    
    if (!producto || !producto.id) {
      console.error('Producto inválido:', producto);
      return false;
    }
    
    // Verificar disponibilidad
    if (!this.inventarioService.verificarDisponibilidad(producto.id)) {
      console.log('Producto no disponible');
      alert('Lo sentimos, este producto no está disponible actualmente');
      return false;
    }
    
    const productos = this.productosCarrito.value;
    const productoExistente = productos.find((p: any) => p.id === producto.id);
    
    // Asegurar que el precio sea un número
    const precio = typeof producto.precio === 'string' ? 
      parseFloat(producto.precio) : producto.precio;
    
    if (productoExistente) {
      if (this.inventarioService.reducirStock(producto.id, 1)) {
        productoExistente.cantidad += 1;
        this.productosCarrito.next([...productos]);
        return true;
      } else {
        alert('Lo sentimos, no hay suficiente stock disponible');
        return false;
      }
    } else {
      if (this.inventarioService.reducirStock(producto.id, 1)) {
        const nuevoProducto = {...producto, cantidad: 1, precio};
        this.productosCarrito.next([...productos, nuevoProducto]);
        return true;
      } else {
        alert('Lo sentimos, no hay suficiente stock disponible');
        return false;
      }
    }
  }

  // Add missing methods that are used in carrito.component.ts
  eliminarProducto(index: number): void {
    const productos = this.productosCarrito.value;
    const producto = productos[index];
    if (producto) {
      // Devolver stock al inventario
      this.inventarioService.aumentarStock(producto.id, producto.cantidad);
      // Eliminar del carrito
      productos.splice(index, 1);
      this.productosCarrito.next([...productos]);
    }
  }

  incrementarCantidad(index: number): void {
    const productos = this.productosCarrito.value;
    const producto = productos[index];
    
    if (producto && this.inventarioService.reducirStock(producto.id, 1)) {
      producto.cantidad += 1;
      this.productosCarrito.next([...productos]);
    } else {
      alert('No hay suficiente stock disponible');
    }
  }

  decrementarCantidad(index: number): void {
    const productos = this.productosCarrito.value;
    const producto = productos[index];
    
    if (producto && producto.cantidad > 1) {
      producto.cantidad -= 1;
      // Devolver una unidad al inventario
      this.inventarioService.aumentarStock(producto.id, 1);
      this.productosCarrito.next([...productos]);
    }
  }

  obtenerProductosCarrito() {
    return this.productosCarrito.value;
  }

  vaciarCarrito() {
    // Devolver todos los productos al inventario
    this.productosCarrito.value.forEach(p => {
      this.inventarioService.aumentarStock(p.id, p.cantidad);
    });
    this.productosCarrito.next([]);
  }

  generar_XML(): string {
    const productos = this.productosCarrito.value;
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<carrito>\n';
    
    productos.forEach(producto => {
      xml += '  <producto>\n';
      xml += `    <id>${producto.id}</id>\n`;
      xml += `    <nombre>${producto.nombre}</nombre>\n`;
      xml += `    <precio>${producto.precio}</precio>\n`;
      xml += `    <cantidad>${producto.cantidad}</cantidad>\n`;
      xml += '  </producto>\n';
    });
    
    xml += '</carrito>';
    
    return xml;
  }

  descargar_XML(): void {
    const xml = this.generar_XML();
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carrito.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}