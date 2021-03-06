import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Cliente } from '../../Models/catalogos/clientes-model';
import { Vendedor } from '../../Models/catalogos/vendedores.model';
import {Observable } from 'rxjs';

import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  constructor(private http:HttpClient) { }
  formData: Cliente;
  formDataV: Vendedor;

  // readonly APIUrl = "https://localhost:44361/api";
  // readonly APIUrl = "http://192.168.1.67:32767/api";
  readonly APIUrl = "http://riztekserver.ddns.net:44361/api";

  getClientesList(): Observable <Cliente[]> {
    return this.http.get<Cliente[]>(this.APIUrl + '/cliente');
  }

  getVendedoresList(): Observable <Vendedor[]> {
    return this.http.get<Vendedor[]>(this.APIUrl + '/vendedor');
  }

  addCliente(cliente: Cliente) {
    return this.http.post(this.APIUrl + '/cliente', cliente);
 }
  addVendedor(vendedor: Vendedor) {
    return this.http.post(this.APIUrl + '/vendedor', vendedor);
 }

 deleteCliente(id:number) {
   return this.http.delete(this.APIUrl + '/cliente/' + id);
 }

 deleteVendedor(id:number) {
   return this.http.delete(this.APIUrl + '/vendedor/' + id);
 }

 updateCliente(cliente: Cliente) {
 return this.http.put(this.APIUrl+ '/cliente', cliente);
 }
 updateVendedor(vendedor: Vendedor) {
 return this.http.put(this.APIUrl+ '/vendedor', vendedor);
 }
 updateUIDCliente(datos:string) {
  console.log(datos);
  
 return this.http.put(this.APIUrl+ '/cliente/UID', datos);
 }


  private _listeners = new Subject<any>(); 
  listen(): Observable<any> {
    return this._listeners.asObservable();
  }
  filter(filterBy: string) {
    this._listeners.next(filterBy);
  }
}
