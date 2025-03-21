import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InventarioService } from './inventario.service';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private productosCarrito = new BehaviorSubject<any[]>([]);
  productos$ = this.productosCarrito.asObservable();

  constructor(private inventarioService: InventarioService) {
    console.log('CarritoService inicializado');
  }

  agregar_Producto(producto: any) {
    console.log('Agregando producto al carrito:', producto);
    
    // Verificar disponibilidad
    if (!this.inventarioService.verificarDisponibilidad(producto.id)) {
      console.log('Producto no disponible');
      alert('Lo sentimos, este producto no está disponible actualmente');
      return false;
    }
    
    const productos = this.productosCarrito.value;
    
    // Asegurarse de que producto.precio sea un número
    const precio = typeof producto.precio === 'string' ? 
      parseFloat(producto.precio) : producto.precio;
    
    const productoExistente = productos.find(p => p.id === producto.id);
    
    if (productoExistente) {
      // Verificar si hay suficiente stock para aumentar la cantidad
      if (this.inventarioService.reducirStock(producto.id, 1)) {
        productoExistente.cantidad = (productoExistente.cantidad || 1) + 1;
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

  obtenerProductos() {
    console.log('Obteniendo productos del carrito:', this.productosCarrito.value);
    return this.productosCarrito.value;
  }
  
  obtener_Carrito() {
    return this.productosCarrito.value;
  }
  
  eliminarProducto(index: number) {
    const productos = this.productosCarrito.value;
    const productoEliminado = productos[index];
    
    // Devolver al inventario
    if (productoEliminado) {
      this.inventarioService.actualizarCantidad(
        productoEliminado.id, 
        this.inventarioService.obtenerInventarioCompleto()
          .find(p => p.id === productoEliminado.id)?.cantidad + productoEliminado.cantidad
      );
    }
    
    productos.splice(index, 1);
    this.productosCarrito.next([...productos]);
    console.log('Producto eliminado. Nuevo carrito:', this.productosCarrito.value);
  }
  
  eliminar_Producto(index: number) {
    this.eliminarProducto(index);
  }
  
  limpiarCarrito() {
    // Devolver todos los productos al inventario
    const productos = this.productosCarrito.value;
    productos.forEach(producto => {
      this.inventarioService.actualizarCantidad(
        producto.id, 
        this.inventarioService.obtenerInventarioCompleto()
          .find(p => p.id === producto.id)?.cantidad + producto.cantidad
      );
    });
    
    this.productosCarrito.next([]);
  }
  
  generar_XML() {
    // Calcular totales
    const productos = this.productosCarrito.value;
    let subtotal = 0;
    
    // Cabecera del XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<recibo fecha="' + new Date().toLocaleDateString() + '" hora="' + new Date().toLocaleTimeString() + '">\n';
    
    // Sección de productos
    xml += '  <productos>\n';
    
    productos.forEach(producto => {
      const precioUnitario = producto.precio;
      const cantidad = producto.cantidad;
      const precioTotal = precioUnitario * cantidad;
      subtotal += precioTotal;
      
      xml += `    <producto id="${producto.id}">\n`;
      xml += `      <nombre>${producto.nombre}</nombre>\n`;
      xml += `      <precioUnitario>${precioUnitario.toFixed(2)}</precioUnitario>\n`;
      xml += `      <cantidad>${cantidad}</cantidad>\n`;
      xml += `      <precioTotal>${precioTotal.toFixed(2)}</precioTotal>\n`;
      xml += `    </producto>\n`;
    });
    
    xml += '  </productos>\n';
    
    // Calcular IVA y total
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    
    // Sección de resumen
    xml += '  <resumen>\n';
    xml += `    <subtotal>${subtotal.toFixed(2)}</subtotal>\n`;
    xml += `    <iva>${iva.toFixed(2)}</iva>\n`;
    xml += `    <total>${total.toFixed(2)}</total>\n`;
    xml += '  </resumen>\n';
    
    xml += '</recibo>';
    
    return xml;
  }
  
  descargar_XML() {
    const xml = this.generar_XML();
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recibo.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  incrementarCantidad(index: number) {
    const productos = this.productosCarrito.value;
    const producto = productos[index];
    
    // Verificar si hay stock disponible para incrementar
    if (this.inventarioService.reducirStock(producto.id, 1)) {
      producto.cantidad += 1;
      this.productosCarrito.next([...productos]);
      return true;
    } else {
      alert('Lo sentimos, no hay suficiente stock disponible');
      return false;
    }
  }

  decrementarCantidad(index: number) {
    const productos = this.productosCarrito.value;
    const producto = productos[index];
    
    if (producto.cantidad > 1) {
      producto.cantidad -= 1;
      
      // Devolver una unidad al inventario
      const inventarioProducto = this.inventarioService.obtenerInventarioCompleto()
        .find(p => p.id === producto.id);
      const nuevaCantidad = (inventarioProducto?.cantidad || 0) + 1;
      this.inventarioService.actualizarCantidad(producto.id, nuevaCantidad);
      
      this.productosCarrito.next([...productos]);
    } else {
      // Si la cantidad llega a 0, eliminamos el producto del carrito
      this.eliminarProducto(index);
    }
    
    return true;
  }
}