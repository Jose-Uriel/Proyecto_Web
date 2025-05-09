import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-recibo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recibo.component.html',
  styleUrl: './recibo.component.css'
})
export class ReciboComponent implements OnInit {
  orderId: string = '';
  orderDate: Date = new Date();
  items: any[] = [];
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;
  paymentError: boolean = false;
  
  constructor(private route: ActivatedRoute, private router: Router) {}
  
  ngOnInit(): void {
    // Get data from localStorage
    const items = localStorage.getItem('orderItems');
    const total = localStorage.getItem('orderTotal');
    const subtotal = localStorage.getItem('orderSubtotal');
    const iva = localStorage.getItem('orderIVA');
    const orderId = localStorage.getItem('orderId');
    const orderDate = localStorage.getItem('orderDate');
    
    if (items) {
      this.items = JSON.parse(items);
    }
    
    this.subtotal = subtotal ? parseFloat(subtotal) : 0;
    this.iva = iva ? parseFloat(iva) : 0;
    this.total = total ? parseFloat(total) : 0;
    this.orderId = orderId || 'N/A';
    this.orderDate = orderDate ? new Date(orderDate) : new Date();
  }
  
  volverTienda() {
    this.router.navigate(['/productos']);
  }
  
  imprimirRecibo() {
    window.print();
  }
  
  // Helper function to convert number to words in Spanish
  numeroALetras(numero: number): string {
    if (!numero || isNaN(numero)) return 'Cero pesos M.X.N.';
    
    const unidades = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 
                     'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 
                     'dieciocho', 'diecinueve', 'veinte'];
    const decenas = ['', '', 'veinti', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 
                     'setecientos', 'ochocientos', 'novecientos'];
    
    // Separar parte entera y decimal
    const partes = numero.toFixed(2).split('.');
    const entero = parseInt(partes[0]);
    const decimal = parseInt(partes[1]);

    // Función para convertir un grupo de números (hasta 999)
    function convertirGrupo(n: number): string {
      let resultado = '';

      // Manejo de las centenas
      if (n >= 100) {
        if (n === 100) {
          return 'cien';
        }
        resultado += centenas[Math.floor(n / 100)] + ' ';
        n %= 100;
      }

      // Manejo de las decenas y unidades
      if (n <= 20) {
        resultado += unidades[n];
      } else if (n <= 29) {
        resultado += decenas[2] + unidades[n - 20];
      } else {
        resultado += decenas[Math.floor(n / 10)];
        if (n % 10 !== 0) {
          resultado += ' y ' + unidades[n % 10];
        }
      }
      
      return resultado.trim();
    }

    // Función para convertir números grandes
    function convertirNumero(n: number): string {
      if (n === 0) return 'cero';
      
      if (n === 1) {
        return 'un';
      } else if (n < 1000) {
        return convertirGrupo(n);
      } else if (n < 1000000) {
        const miles = Math.floor(n / 1000);
        const resto = n % 1000;
        
        if (miles === 1) {
          return 'mil' + (resto > 0 ? ' ' + convertirNumero(resto) : '');
        } else {
          return convertirNumero(miles) + ' mil' + (resto > 0 ? ' ' + convertirNumero(resto) : '');
        }
      } else {
        const millones = Math.floor(n / 1000000);
        const resto = n % 1000000;
        
        if (millones === 1) {
          return 'un millón' + (resto > 0 ? ' ' + convertirNumero(resto) : '');
        } else {
          return convertirNumero(millones) + ' millones' + (resto > 0 ? ' ' + convertirNumero(resto) : '');
        }
      }
    }

    // Construir resultado para la parte entera
    let resultado = convertirNumero(entero) + ' pesos';
    
    // Agregar centavos si es necesario (convertidos a palabras)
    if (decimal > 0) {
      resultado += ' con ' + convertirNumero(decimal) + ' centavos';
    }
    
    // Añadir M.X.N. al final
    resultado += ' M.X.N.';

    // Capitalizar primera letra
    return resultado.charAt(0).toUpperCase() + resultado.slice(1);
  }
}
