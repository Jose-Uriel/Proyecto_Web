import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';
import { BehaviorSubject } from 'rxjs';

@Injectable
({
  providedIn: 'root'
})
export class InventarioService 
{
  // Usar BehaviorSubject para notificar cambios a los componentes suscritos
  private inventarioSubject = new BehaviorSubject<Producto[]>([]);
  public inventario$ = this.inventarioSubject.asObservable();

  constructor() 
  {
    // Inicializar con datos de ejemplo
    this.inicializarInventario();
  }

  private inicializarInventario(): void 
  {
    const productosIniciales: Producto[] = [
      new Producto(21410, "Nintendo 3DS", 2500, 5, "assets/Portatil/Nintendo/3DS/3DS/Normales/3DS.jpg"),
      new Producto(21420, "Nintendo 3DS XL", 2800, 3, "/assets/Portatil/Nintendo/3DS/3DS_XL/Normales/3DSXL.jpg"),
      new Producto(21430, "Nintendo 2DS", 2000, 7, "assets/Portatil/Nintendo/3DS/2DS/Normales/2DS.jpg"),
      new Producto(21440, "Nintendo New 2DS XL", 3000, 2, "assets/Portatil/Nintendo/3DS/New_2DS_XL/Normales/NEW2DSXL.jpg"),
      new Producto(21450, "Nintendo New 3DS", 3000, 0, "assets/New 3DS.jpg"),
      new Producto(21460, "Nintendo New 3DS XL", 3500, 4, "/assets/Portatil/Nintendo/3DS/New_3DS_XL/Normales/NEW3DSXL.jpg")
    ];
    this.inventarioSubject.next(productosIniciales);
  }

  // Obtener todos los productos del inventario
  obtenerInventarioCompleto(): Producto[]
  {
    return this.inventarioSubject.value;
  }

  // Obtener solo productos disponibles (cantidad > 0)
  obtenerProductosDisponibles(): Producto[] 
  {
    return this.inventarioSubject.value.filter(producto => producto.cantidad > 0);
  }

  // Agregar un nuevo producto al inventario
  agregarProducto(producto: Producto): void 
  {
    const inventarioActual = this.inventarioSubject.value;
    this.inventarioSubject.next([...inventarioActual, producto]);
  }

  // Eliminar un producto del inventario
  eliminarProducto(id: number): void 
  {
    const inventarioActual = this.inventarioSubject.value;
    const nuevoInventario = inventarioActual.filter(producto => producto.id !== id);
    this.inventarioSubject.next(nuevoInventario);
  }

  // Actualizar un producto existente
  actualizarProducto(productoActualizado: Producto): void 
  {
    const inventarioActual = this.inventarioSubject.value;
    const nuevoInventario = inventarioActual.map
    (producto => 
      producto.id === productoActualizado.id ? productoActualizado : producto
    );
    this.inventarioSubject.next(nuevoInventario);
  }

  // Actualizar solo la cantidad de un producto
  actualizarCantidad(id: number, nuevaCantidad: number): void 
  {
    const inventarioActual = this.inventarioSubject.value;
    const nuevoInventario = inventarioActual.map(producto => 
    {
      if (producto.id === id) 
      {
        return {...producto, cantidad: nuevaCantidad};
      }
      return producto;
    });
    this.inventarioSubject.next(nuevoInventario);
  }

  // Verificar disponibilidad de un producto
  verificarDisponibilidad(id: number): boolean 
  {
    const producto = this.inventarioSubject.value.find(p => p.id === id);
    return producto ? producto.cantidad > 0 : false;
  }

  // Reducir la cantidad de un producto cuando se agrega al carrito
  reducirStock(id: number, cantidad: number = 1): boolean 
  {
    const inventarioActual = this.inventarioSubject.value;
    const producto = inventarioActual.find(p => p.id === id);
    
    if (!producto || producto.cantidad < cantidad) 
    {
      return false; // No hay suficiente stock
    }
    
    const nuevoInventario = inventarioActual.map(p => 
    {
      if (p.id === id) 
      {
        return {...p, cantidad: p.cantidad - cantidad};
      }
      return p;
    });
    
    this.inventarioSubject.next(nuevoInventario);
    return true;
  }

  generar_XML(): string 
  {
    const productos = this.inventarioSubject.value;
    
    // Cabecera del XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<inventario fecha="${new Date().toLocaleDateString()}" hora="${new Date().toLocaleTimeString()}">\n`;
    
    // Información de cada producto
    productos.forEach(producto => {
      xml += `  <producto id="${producto.id}">\n`;
      xml += `    <nombre>${producto.nombre}</nombre>\n`;
      xml += `    <precio>${producto.precio.toFixed(2)}</precio>\n`;
      xml += `    <cantidad>${producto.cantidad}</cantidad>\n`;
      xml += `    <disponible>${producto.cantidad > 0 ? 'si' : 'no'}</disponible>\n`;
      xml += `    <imagen>${producto.imagen}</imagen>\n`;
      xml += `  </producto>\n`;
    });
    
    // Resumen del inventario
    const totalProductos = productos.length;
    const productosDisponibles = productos.filter(p => p.cantidad > 0).length;
    const valorTotal = productos.reduce((suma, p) => suma + (p.precio * p.cantidad), 0);
    
    xml += `  <resumen>\n`;
    xml += `    <totalProductos>${totalProductos}</totalProductos>\n`;
    xml += `    <productosDisponibles>${productosDisponibles}</productosDisponibles>\n`;
    xml += `    <productosAgotados>${totalProductos - productosDisponibles}</productosAgotados>\n`;
    xml += `    <valorInventario>${valorTotal.toFixed(2)}</valorInventario>\n`;
    xml += `  </resumen>\n`;
    
    xml += '</inventario>';
    return xml;
  }

  // Descargar XML del inventario
  descargar_XML(): void 
  {
    const xml = this.generar_XML();
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    // Crear el elemento <a> para la descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_${new Date().toISOString().slice(0, 10)}.xml`;
    
    // Añadir al documento, ejecutar click y luego eliminar
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Liberar el URL creado
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }

}