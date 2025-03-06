import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';

@Injectable
(
  {
  providedIn: 'root'
  }
)

export class ProductoService 
{
  /* 
  ID: [tipo_consola][Compañia][Generacion][variante][Edicion Especial]

  tipo_consola:
  1: SobreMesa
  2: Portatil
  3: Hibrida / PC

  Compañia:
  1: Nintendo
  2: Sony
  3: Xbox
  4: Otros

  Generacion: (Nintendo)
  1: Game Boy
  2: Game boy Advance
  3: DS
  4: 3DS

  variante: (3DS)
  1: 3DS
  2: 3DS XL
  3: 2DS
  4: New 2DS XL
  5: New 3DS
  6: New 3DS XL
  
  Edicion Especial: (3DS)
  0: No es edicion especial
  1: Mario
  2: Zelda
  3: Pokemon

  Ejemplo GameBoy Advance SP:
  ID: [Portatil][Nintendo][GameBoy Advance][SP] (No es edicion especial)
  ID: 21220
  */
  private productos : Producto[] = 
  [
    new Producto(21410,"Nintendo 3DS",2500,"assets/Portatil/Nintendo/3DS/3DS/Normales/3DS.jpg"),
    new Producto(21420,"Nintendo 3DS XL",2800,"assets/3DS XL.jpg"),
    new Producto(21430,"Nintendo 2DS",2000,"assets/2DS.jpg"),
    new Producto(21440,"Nintendo New 2DS XL",3000,"assets/New 2DS XL.jpg"),
    new Producto(21450,"Nintendo New 3DS",3000,"assets/New 3DS.jpg"),
    new Producto(21460,"Nintendo New 3DS XL",3500,"assets/New 3DS XL.jpg")
  ];
  obtener_Producto() : Producto[]
  {
    return this.productos;
  }

  constructor() { }
}
