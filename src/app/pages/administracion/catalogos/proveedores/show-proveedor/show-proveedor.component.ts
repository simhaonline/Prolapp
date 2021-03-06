import { Component, OnInit, ViewChild } from '@angular/core';

import {MatTableDataSource, MatSort, MatPaginator} from '@angular/material';
import { Proveedor } from '../../../../../Models/catalogos/proveedores-model';
import { ProveedoresService } from '../../../../../services/catalogos/proveedores.service';

import { MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';
import { AddProveedorComponent } from '../add-proveedor/add-proveedor.component';
import { EditProveedorComponent } from '../edit-proveedor/edit-proveedor.component';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-proveedor',
  templateUrl: './show-proveedor.component.html',
  styleUrls: ['./show-proveedor.component.css']
})
export class ShowProveedorComponent implements OnInit {

  listData: MatTableDataSource<any>;
  displayedColumns : string [] = [ 'Nombre', 'RFC', 'RazonSocial', 'Calle', 'Colonia', 'CP', 'Ciudad', 'Estado', 'NumeroExterior', 'ClaveProveedor', 'Estatus', 'Options'];
  @ViewChild(MatSort, null) sort : MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private service:ProveedoresService, private dialog: MatDialog, private snackBar: MatSnackBar) {

    this.service.listen().subscribe((m:any)=>{
      // console.log(m);
      this.refreshProveedoresList();
      });

   }

  ngOnInit() {
    this.refreshProveedoresList();
  }

  refreshProveedoresList() {

    this.service.getProveedoresList().subscribe(data => {
      this.listData = new MatTableDataSource(data);
      this.listData.sort = this.sort;
      this.listData.paginator = this.paginator;
      this.listData.paginator._intl.itemsPerPageLabel = 'Productos por Pagina';
    //console.log(this.listData);
    });

  }

  onDelete( id:number){

    Swal.fire({
      title: '¿Seguro de Borrar Proveedor?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.service.deleteProveedor(id).subscribe(res => {
          this.refreshProveedoresList();
    
          Swal.fire({
            title: 'Borrado',
            icon: 'success',
            timer: 1000,
            showCancelButton: false,
            showConfirmButton: false
        });
          });
      }
    })
  }

  onAdd(){

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width="70%";
    this.dialog.open(AddProveedorComponent, dialogConfig);

  }

  onEdit(proveedor: Proveedor){
// console.log(usuario);
this.service.formData = proveedor;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width="70%";
    this.dialog.open(EditProveedorComponent, dialogConfig);
  }

  applyFilter(filtervalue: string){  
    this.listData.filter= filtervalue.trim().toLocaleLowerCase();

  }

}
