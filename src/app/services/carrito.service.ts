import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';

@Injectable
({
  providedIn: 'root'
})

export class CarritoService 
{
  private carrito:Producto[]=[];

  agregar_Producto(producto:Producto)
  {
    this.carrito.push(producto);
  }

  eliminar_Producto(index: number) 
  {
    this.carrito.splice(index, 1);
  }

  obtener_Carrito():Producto[]
  {
    return this.carrito;
  }

  generar_XML():string
  {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n';
    this.carrito.forEach((producto, index)=>
      {
        xml += `<producto id="${producto.id}"><nombre>${producto.nombre}</nombre><precio>$${producto.precio}</precio></producto>\n`;
      });
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
