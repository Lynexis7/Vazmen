import { sanitizeIdentifier } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Inventario } from '../models/inventario';
import { Ventas } from '../models/ventas';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  cont: any;
  inventario: Inventario = new Inventario();
  datePipe: DatePipe = new DatePipe('en-US');

  constructor(public firestore: AngularFirestore) { }

  getVariedad() {
    return this.firestore.collection('Inventario').snapshotChanges();
  }

  getCantidad(variedad) {
    return this.firestore.collection('Inventario', ref => ref.where('Variedad', '==', variedad)).snapshotChanges();
  }

  generarVenta(venta: Ventas) {
    this.firestore.collection('Ventas').add(venta);
    this.actualizarInventario(venta);
  }

  actualizarInventario(venta: Ventas) {
    this.cont = 0;
    let doc = this.firestore.collection('Inventario', ref => ref.where('Variedad', '==', venta['Variedad']));
    doc.snapshotChanges().subscribe(data => {
      if (data) {
        console.log(data);
        let cantidad = data[0].payload.doc.data()['Cantidad'];
        this.inventario.Cantidad = cantidad;
      }
      this.inventario.Cantidad = this.inventario.Cantidad - venta.Cantidad;
      this.cont++;
      if (this.cont == 1) {
        this.firestore.doc('Inventario/' + venta['Variedad']).update({ 'Cantidad': this.inventario.Cantidad });
      }
    });
  }

  getVentasPendientes() {
    return this.firestore.collection('Ventas', ref => ref.where('Pendiente', '==', true)).snapshotChanges();
  }

  getVentasDelDia() {
    let dia = new Date();
    return this.firestore.collection('Ventas', ref => ref.where('Dia', '==', dia.getDate())).snapshotChanges();
  }

  getProveedores() {
    return this.firestore.collection('Proveedores').snapshotChanges();
  }

  actualizarVentaPendiente(vp, id) {
    
    this.firestore.collection('Ventas').doc(id).set({
      Año: vp.Año,
      Mes: vp.Mes,
      Dia: vp.Dia,
      Nombre: "",
      Pendiente: true,
      Proveedor: vp.Proveedor,
      Cantidad: vp.Cantidad,
      Variedad: vp.Variedad,
      totalVenta: vp.totalVenta
    });
  }
}
