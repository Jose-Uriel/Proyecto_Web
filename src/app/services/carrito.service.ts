import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';

@Injectable
({
  providedIn: 'root'
})

export class CarritoService 
{
  private carrito:Producto[]=[];

  agregar_Producto(producto: Producto) {
    const existingProduct = this.carrito.find(p => p.id === producto.id);
    if (existingProduct) {
      existingProduct.cantidad += 1;
    } else {
      producto.cantidad = 1;
      this.carrito.push(producto);
    }
  }

  eliminar_Producto(index: number) 
  {
    this.carrito.splice(index, 1);
  }

  obtener_Carrito():Producto[]
  {
    return this.carrito;
  }

  generar_XML(): string
  {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n';
    let subtotal = 0;

    this.carrito.forEach((producto, index) =>
    {
      const totalProducto = producto.precio * producto.cantidad;
      subtotal += totalProducto;
      xml += `<producto id="${producto.id}"><nombre>${producto.nombre}</nombre><precio>${producto.precio}</precio><cantidad>${producto.cantidad}</cantidad><total>${totalProducto}</total></producto>\n`;
    });

    const iva = subtotal * 0.16; // Assuming IVA is 16%
    const total = subtotal + iva;

    xml += `<subtotal>${subtotal}</subtotal>\n`;
    xml += `<iva>${iva}</iva>\n`;
    xml += `<total>${total}</total>\n`;
    xml += '</recibo>';

    return xml;
  }

  descargar_XML()
  {
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

  constructor() { }
}
