export class Producto
{
    constructor
    (
        public id: number,
        public nombre: string,
        public precio: number,
        public cantidad: number,
        public imagen: string,
        public categoryId: number = 1,
        public description: string = ''
    )   {   }
}