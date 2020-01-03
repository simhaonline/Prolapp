import { Component, OnInit, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogConfig, MatSnackBar, MatDivider } from '@angular/material';
import { FacturaService } from '../../../../services/facturacioncxc/factura.service';
import { NgForm } from '@angular/forms';
import { Cliente } from '../../../../Models/catalogos/clientes-model';
import { Router, ActivatedRoute } from '@angular/router';
import { EnviarfacturaService } from 'src/app/services/facturacioncxc/enviarfactura.service';
import { FacturacioncxcProductoComponent } from '../facturacioncxc-producto/facturacioncxc-producto.component';
import { Factura } from 'src/app/Models/facturacioncxc/factura-model';
import { MatTableDataSource, MatSort } from '@angular/material';
import { DetalleFactura } from '../../../../Models/facturacioncxc/detalleFactura-model';
import { FacturacioncxcEditProductoComponent } from '../facturacioncxc-edit-producto/facturacioncxc-edit-producto.component';
import { FacturaTimbre } from '../../../../Models/facturacioncxc/facturatimbre-model';
import { Observable } from 'rxjs';
import * as html2pdf from 'html2pdf.js';
import Swal from 'sweetalert2';
import { MessageService } from '../../../../services/message.service';









@Component({
  selector: 'app-facturacioncxc-add',
  templateUrl: './facturacioncxc-add.component.html',
  
})
export class FacturacioncxcAddComponent implements OnInit {
  // json1: FacturaTimbre;

  
  json1 =  new FacturaTimbre();
  folio: string;
  xmlparam;
  fileUrl;
  a = document.createElement('a');
  

  constructor(
    public service: FacturaService, private snackBar: MatSnackBar, private dialog: MatDialog, 
    private router: Router, public enviarfact: EnviarfacturaService,
    private activatedRoute: ActivatedRoute, public _MessageService: MessageService ) { 

      

      this.activatedRoute.params.subscribe(  params =>{
        this.IdFactura = params['id'];
        
        
        // console.log("El ID de la Factura es: "+this.IdFactura);
        // console.log(params['id']); 
        this.service.IdFactura = this.IdFactura;
        this.proceso='';
        
        // this.resetForm();
        
        
        
      });
      
      //Observable para actualizar tabla de Detalles Factura
      this.service.listen().subscribe((m:any)=>{
        // console.log(m);
        this.refreshDetallesFacturaList();
        });
        
      }
      
      IdFactura: any;
  listClientes: Cliente[] = [];
  proceso: string;

  Moneda: string;

  estatusfact;
  numfact;
  xml;

  Estatus: string;

  // list Metodo Pago
  public listMP: Array<Object> = [
    { MetodoDePago: 'PUE', text: 'PUE-Pago en una sola exhibicion' },
    { MetodoDePago: 'PPD', text: 'PPD-Pago en parcialidades o diferido' }
  ];

   // list Metodo Pago
   public listMoneda: Array<Object> = [
    { Moneda: 'MXN'},
    { Moneda: 'USD' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.refreshDetallesFacturaList();
  }
  
  ngOnInit() {
    this.resetForm();
    
    this.setfacturatimbre();
    this.dropdownRefresh();
    this.refreshDetallesFacturaList();
  }
   //Informacion para tabla de productos
   listData: MatTableDataSource<any>;
   displayedColumns: string[] = ['ClaveProducto', 'ClaveSAT' , 'Producto', 'Cantidad', 'Precio', 'Options'];
   @ViewChild(MatSort, null) sort: MatSort;


   //Funcion Refresh Tabla Detalles Factura
  refreshDetallesFacturaList() {
    let subtotal;
    let iva;
    let total;
    let tipoCambio;
    let ivaDlls;
    let subtotalDlls;
    let totalDlls;
    
    this.service.getDetallesFacturaList(this.IdFactura).subscribe(data => {
      this.listData = new MatTableDataSource(data);
      this.listData.sort = this.sort;
      tipoCambio = 20;
      subtotal = 0;
      iva = 0;
      total = 0;
      subtotalDlls = 0;
      totalDlls = 0;
      ivaDlls = 0;
      for (let i = 0; i < data.length; i++) {
        subtotal = subtotal + parseInt(data[i].Importe);
      }
      iva = subtotal * 0.16;
      total = iva + subtotal;
      for (let i = 0; i < data.length; i++) {
        subtotalDlls = subtotalDlls + parseInt(data[i].ImporteDlls);
      }
      ivaDlls = subtotalDlls * 0.16;
      totalDlls = ivaDlls + subtotalDlls;
      // console.log(subtotal);
      // console.log(iva);
      // console.log(total);
      this.service.formData.Subtotal = subtotal;
      this.service.formData.ImpuestosTrasladados = iva;
      this.service.formData.Total = total;
      this.service.formData.SubtotalDlls = subtotalDlls;
      this.service.formData.ImpuestosTrasladadosDlls = ivaDlls;
      this.service.formData.TotalDlls = totalDlls;
      
    //console.log(this.listData);
    });

  }

  //Filtro de Detalles Factura
  applyFilter(filtervalue: string){  
    this.listData.filter= filtervalue.trim().toLocaleLowerCase();

  }


  dropdownRefresh() {

    this.service.getDepDropDownValues().subscribe((data) => {
      // console.log(data);
      for (let i = 0; i < data.length; i++) {
        let client = data[i];
        this.listClientes.push(client);
      }
      // console.log(this.listClientes);
    });
  }
  
  //Forma Pago
  public listFP: Array<Object> = [
    { FormaDePago: "01", text: "01-Efectivo" },
    { FormaDePago: "02", text: "02-Cheque nominativo" },
    { FormaDePago: "03", text: "03-Transferencia electrónica de fondos" },
    { FormaDePago: "04", text: "04-Tarjeta de crédito" },
    { FormaDePago: "05", text: "05-Monedero electrónico" },
    { FormaDePago: "06", text: "06-Dinero electrónico" },
    { FormaDePago: "08", text: "08-Vales de despensa" },
    { FormaDePago: "12", text: "12-Dación en pago" },
    { FormaDePago: "13", text: "13-Pago por subrogación" },
    { FormaDePago: "14", text: "14-Pago por consignación" },
    { FormaDePago: "15", text: "15-Condonación" },
    { FormaDePago: "17", text: "17-Compensación" },
    { FormaDePago: "23", text: "23-Novación" },
    { FormaDePago: "24", text: "24-Confusión" },
    { FormaDePago: "25", text: "25-Remisión de deuda" },
    { FormaDePago: "26", text: "26-Prescripción o caducidad" },
    { FormaDePago: "27", text: "27-A satisfacción del acreedor" },
    { FormaDePago: "28", text: "28-Tarjeta de débito" },
    { FormaDePago: "29", text: "29-Tarjeta de servicios" },
    { FormaDePago: "30", text: "30-Aplicación de anticipos" },
    { FormaDePago: "31", text: "31-Intermediario pagos" },
    { FormaDePago: "99", text: "99-Por definir" }
  ];
  //list CFDI
  public listCFDI: Array<Object> = [
    { UsoDelCFDI: "G01", text: "G01-Adquisición de mercancias" },
    { UsoDelCFDI: "G02", text: "G02-Devoluciones, descuentos o bonificaciones" },
    { UsoDelCFDI: "G03", text: "G03-Gastos en general" },
    { UsoDelCFDI: "I01", text: "I01-Construcciones" },
    { UsoDelCFDI: "I02", text: "I02-Mobilario y equipo de oficina por inversiones" },
    { UsoDelCFDI: "I03", text: "I03-Equipo de transporte" },
    { UsoDelCFDI: "I04", text: "I04-Equipo de computo y accesorios" },
    { UsoDelCFDI: "I05", text: "I05-Dados, troqueles, moldes, matrices y herramental" },
    { UsoDelCFDI: "I06", text: "I06-Comunicaciones telefónicas" },
    { UsoDelCFDI: "I07", text: "I07-Comunicaciones satelitales" },
    { UsoDelCFDI: "I08", text: "I08-Otra maquinaria y equipo" },
    { UsoDelCFDI: "D01", text: "D01-Honorarios médicos, dentales y gastos hospitalarios" },
    { UsoDelCFDI: "D02", text: "D02-Gastos médicos por incapacidad o discapacidad" },
    { UsoDelCFDI: "D03", text: "D03-Gastos funerales" },
    { UsoDelCFDI: "D04", text: "D04-Donativos" },
    { UsoDelCFDI: "D05", text: "D05-Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)" },
    { UsoDelCFDI: "D06", text: "D06-Aportaciones voluntarias al SAR" },
    { UsoDelCFDI: "D07", text: "D07-Primas por seguros de gastos médicos" },
    { UsoDelCFDI: "D08", text: "D08-Gastos de transportación escolar obligatoria" },
    { UsoDelCFDI: "D09", text: "D09-Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones" },
    { UsoDelCFDI: "D10", text: "D10-Pagos por servicios educativos (colegiaturas)" },
    { UsoDelCFDI: "P01", text: "P01-Por definir" }
  ];

  Regresar() {
    this.router.navigateByUrl('/facturacionCxc');
  }
  
//Editar detalle factura
onEdit(detalleFactura: DetalleFactura){
  // console.log(detalleFactura);
      this.service.formDataDF = detalleFactura;
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.width="70%";
      this.dialog.open(FacturacioncxcEditProductoComponent, dialogConfig);
    }
//Eliminar Detalle Factura
    onDelete( id:number){
      // console.log(id);
      if ( confirm('Are you sure to delete?')) {
        this.service.deleteDetalleFactura(id).subscribe(res => {
        this.refreshDetallesFacturaList();
        this.snackBar.open(res.toString(), '', {
          duration: 3000,
          verticalPosition: 'top'
        });
  
        });
      }
  
    }
    //Agregar Detalle Factura
  onAddProducto() {
    
    // console.log(usuario);
    // this.service.formData = factura;
    // console.log(form.value);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "70%";
    this.dialog.open(FacturacioncxcProductoComponent, dialogConfig);
  }

  MonedaSelected(event: any){
    console.log(event);
    // this.Moneda = event.target.value;
    // console.log(this.Moneda);
    // this.service.Moneda = this.Moneda;
    // console.log(this.service.Moneda);
  }


  // applyFilter(filtervalue: string) {
  //   this.listData.filter = filtervalue.trim().toLocaleLowerCase();

  // }

  resetForm(form?: NgForm) {
    // if (form != null)
    //   form.resetForm();
    
    
    this.service.getFacturaId(this.IdFactura).subscribe(res => {
      // console.log(this.IdFactura + "ESTE ES EL ID FACTURA");
        // console.log(res);
        // this.refreshDetallesFacturaList();
        this.service.formData = res[0];
        // console.log(this.service.formData);
        
        this.Estatus = this.service.formData.Estatus;
        // console.log(this.Estatus);
        
        if (this.Estatus==='Timbrada' || this.Estatus==='Cancelada'){
          let nodes = document.getElementById('div1').getElementsByTagName('*');
          for (let i = 0; i < nodes.length; i++){
            nodes[i].setAttribute('disabled','true')
          }
          // console.log('1');
          
        }
        // console.log(this.service.formData);
        });

    //this.service.formData = {
      //Factura
      // Id: 0,
      // IdCliente: 0,
      // Serie: '',
      // Folio: '',
      // Tipo: '',
      // FechaDeExpedicion: new Date(),
      // LugarDeExpedicion: '',
      // Certificado: '',
      // NumeroDeCertificado: '',
      // UUID: '',
      // UsoDelCFDI: '',
      // Subtotal: '',
      // Descuento: '',
      // ImpuestosRetenidos: '',
      // ImpuestosTrasladados: '',
      // Total: '',
      // FormaDePago: '',
      // MetodoDePago: '',
      // Cuenta: '',
      // Moneda: '',
      // CadenaOriginal: '',
      // SelloDigitalSAT: '',
      // SelloDigitalCFDI: '',
      // NumeroDeSelloSAT: '',
      // RFCdelPAC: '',
      // Observaciones: '',
      // FechaVencimiento: new Date(),
      // OrdenDeCompra: '',
      // TipoDeCambio: '',
      // FechaDeEntrega: new Date(),
      // CondicionesDePago: '',
      // Vendedor: '',
      // Estatus: '',
      // Version: '',
      // Usuario: '',
    // }

  }

  crearjsonfactura(id:number): string{

    let cadena:string;

    this.service.getFacturasClienteID(id).subscribe(data =>{

      // console.log(data[0]);
      
      this.json1.Receptor.UID=data[0].IdApi;
      // console.log(this.json.Receptor.UID);
      
      this.json1.TipoDocumento = 'factura';
      this.json1.Impuestos.Traslados.pop();
      this.json1.Impuestos.Traslados.push({
        "Base": data[0].Subtotal,
        "Impuesto": "002",
        "TipoFactor": "Tasa",
        "TasaOCuota": "0.16",
        "Importe": data[0].ImpuestosTrasladados
      });
      this.json1.Impuestos.Retenidos.pop();
    this.json1.Impuestos.Locales.pop();
    this.json1.CfdiRelacionados.TipoRelacion = '';
    this.json1.CfdiRelacionados.UUID.push();
    this.json1.UsoCFDI = data[0].UsoDelCFDI;
    this.json1.Serie = data[0].Serie;
    this.json1.FormaPago = data[0].FormaDePago;
    this.json1.MetodoPago = data[0].MetodoDePago;
    this.json1.Moneda = data[0].Moneda;
    this.json1.EnviarCorreo = false;

    // console.log(this.json);
   
    


    this.service.getDetallesFacturaListProducto(id).subscribe(data => {
      // console.log(data);
      // console.log(data[0]);
      
      this.json1.Conceptos.pop();
      // console.log(data.length);
      
      for (let i=0; i< data.length; i++){
        this.json1.Conceptos.push({
          ClaveProdServ: data[i].ClaveSAT,
          NoIdentificacion: data[i].ClaveProducto,
          Cantidad: data[i].Cantidad,
          ClaveUnidad: data[i].UnidadMedida,
          Unidad: data[i].Unidad,
          Descripcion: data[i].DescripcionProducto,
          ValorUnitario: data[i].PrecioUnitario,
          Importe: data[i].Importe,
          Descuento: '0',
          tipoDesc: 'porcentaje',
          honorarioInverso: '',
          montoHonorario: '0',
          Impuestos:{
            Traslados:[{
                Base: data[i].Importe,
                Impuesto: '002',
                TipoFactor: 'Tasa',
                TasaOCuota: '0.16',
                Importe: (parseInt(data[i].Importe)*0.16).toString()
                
                
            }]
          },
          NumeroPedimento: "",
              Predial: "",
              Partes: "0",
              Complemento: "0"
        });
        
      }
      
      // console.log(this.json1);
      // console.log(JSON.stringify(this.json1));
      // this.json1 = JSON.stringify(this.json1);
      
      
      cadena = JSON.stringify(this.json1); 
      // console.log(cadena);
      
      this.enviar(cadena);
    })
    
//  console.log(this.json);



// return JSON.stringify(this.json1)

});




return cadena;



  
    
    

    
    
    
    
   
   
    


      
      


    // let datosfact = JSON.stringify(
    //   {
    //     "Receptor": {
    //       "UID": "5de771f1a1203"
    //     },
    //     "TipoDocumento": "factura",
    //     "Conceptos": [
    //       {
    //         "ClaveProdServ": "43232408",
    //         "NoIdentificacion": "WEBDEV10",
    //         "Cantidad": "1.000000",
    //         "ClaveUnidad": "E48",
    //         "Unidad": "Unidad de servicio",
    //         "Descripcion": "Desarrollo web a la medida",
    //         "ValorUnitario": "15000.000000",
    //         "Importe": "15000.000000",
    //         "Descuento": "0",
    //         "tipoDesc": "porcentaje",
    //         "honorarioInverso": "",
    //         "montoHonorario": "0",
    //         "Impuestos": {
    //           "Traslados": [
    //             {
    //               "Base": "15000.000000",
    //               "Impuesto": "002",
    //               "TipoFactor": "Tasa",
    //               "TasaOCuota": "0.16",
    //               "Importe": "2400.000000"
    //             }
    //           ],
    //           "Retenidos": [],
    //           "Locales": []
    //         },
    //         "NumeroPedimento": "",
    //         "Predial": "",
    //         "Partes": "0",
    //         "Complemento": "0"
    //       }
    //     ],
    //     "Impuestos": {
    //       "Traslados": [
    //         {
    //           "Base": "15000.000000",
    //           "Impuesto": "002",
    //           "TipoFactor": "Tasa",
    //           "TasaOCuota": "0.16",
    //           "Importe": "2400.000000"
    //         }
    //       ],
    //       "Retenidos": [],
    //       "Locales": []
    //     },
    //     "CfdiRelacionados": {
    //       "TipoRelacion": "",
    //       "UUID": []
    //     },
    //     "UsoCFDI": "G03",
    //     "Serie": 5352,
    //     "FormaPago": "03",
    //     "MetodoPago": "PUE",
    //     "Moneda": "MXN",
    //     "EnviarCorreo": false
    //   });

      // return JSON.stringify(this.json);

  }



  onSubmit(form: NgForm) {
    this.service.formData.Tipo = 'Ingreso';
    this.service.formData.Estatus = 'Creada';
    this.service.formData.Version = '3.3';
    this.service.formData.Id= +this.IdFactura;
    this.service.updateFactura(this.service.formData).subscribe( res =>
      {
        this.resetForm(form);
        this.snackBar.open(res.toString(),'',{
          duration: 5000,
          verticalPosition: 'top'
        });
        // this.enviar(this.IdFactura);
        // this.crearjsonfactura(this.IdFactura); 

      }
      );

    // console.log(this.service.formData);
  }

  timbrar(form: NgForm){
    this.proceso='Timbrando';
    this.service.formData.Tipo = 'Ingreso';
    this.service.formData.Estatus = 'Creada';
    this.service.formData.Version = '3.3';
    this.service.formData.Serie = '5628';
    this.service.formData.Id= +this.IdFactura;
    this.service.updateFactura(this.service.formData).subscribe( res =>
      {
        this.resetForm(form);
        // this.snackBar.open(res.toString(),'',{
        //   duration: 5000,
        //   verticalPosition: 'top'
        // });
        // this.enviar(this.IdFactura);
        this.crearjsonfactura(this.IdFactura); 

      }
      );

  }

  enviar(cadena:string) {
  
    
    
    // Aqui manda la factura
    this.enviarfact.enviarFactura(cadena).subscribe(data => {
      // console.log(data);
      if (data.response === 'success') {
        // console.log('Factura Creada');
        this.service.formData.LugarDeExpedicion='31203';
        this.service.formData.NumeroDeCertificado='00001000000403628664';
        // tslint:disable-next-line: max-line-length
        this.service.formData.Certificado='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';
        
        // console.log(this.service.formData);
        
        this.service.formData.UUID = data.UUID;
        this.service.formData.CadenaOriginal='||'+data.SAT.Version+'|'+data.SAT.UUID+'|'+data.SAT.FechaTimbrado+'|LSO1306189R5|'+data.SAT.SelloCFD+'|'+data.SAT.NoCertificadoSAT+'||';
        this.service.formData.SelloDigitalSAT=data.SAT.SelloSAT;
        this.service.formData.SelloDigitalCFDI=data.SAT.SelloCFD;
        this.service.formData.NumeroDeSelloSAT=data.SAT.NoCertificadoSAT;
        this.service.formData.RFCdelPAC='LSO1306189R5';
        this.service.formData.Estatus='Timbrada';
    
        
        this.numfact = data.UUID;

        // console.log(this.service.formData);
        
        this.service.updateFactura(this.service.formData).subscribe(data =>{
          // console.log(this.service.formData);
          // console.log('Factura Actualizada');
          Swal.fire(
            'Factura Creada',
            ''+this.numfact+'',
            'success'
          )
          
          this.dxml2(this.numfact,this.service.formData.Folio);
          // this.resetForm();





          // this.onExportClick(this.service.formData.Folio);
          
          // console.log(data);
          
          
        });

        
        this.estatusfact = 'Factura Creada ' + data.invoice_uid;
        
      }
      if (data.response === 'error') {
        // console.log('error');
        this.estatusfact = data.response + ' ' + data.message;
      }
    })

    // console.log(datosfact);
    

  }

  verfolios() {

    //5df9887b8fa49
  }

 

  dxml(id: string, folio:string) {
    // window.location.href="http://devfactura.in/admin/cfdi33/5df9887b8fa49/xml";
    this.proceso='xml';
    let xml = 'http://devfactura.in/api/v3/cfdi33/' + id + '/xml';
    this.enviarfact.xml(id).subscribe(data => {
      // localStorage.removeItem('xml')
      localStorage.setItem('xml',data)
      const blob = new Blob([data as BlobPart], { type: 'application/xml' });
      // this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
      this.fileUrl = window.URL.createObjectURL(blob);
      
      
      this.a.href = this.fileUrl;
      this.a.target = '_blank';
      this.a.download = 'F-'+folio+'.xml';
      
      document.body.appendChild(this.a);
//      console.log(this.fileUrl);
      // console.log(this.a);
      // console.log('blob:'+this.a.href);
      
      this.a.click();
      do {
        this.xmlparam = localStorage.getItem('xml');
        console.log(this.xmlparam);
        
        if (localStorage.getItem('xml')!=null){
          console.log('no nulo');
          this.xmlparam = localStorage.getItem('xml');
          this.onExportClick(this.service.formData.Folio);
        }
      }
      while (localStorage.getItem('xml')==null);
      this.resetForm();      
      // console.log(this.xmlparam);
      
      
      return this.fileUrl;

      // console.log(this.fileUrl);
      
      
    });

    
    
    

  }
  dxml2(id: string, folio:string) {
    // window.location.href="http://devfactura.in/admin/cfdi33/5df9887b8fa49/xml";
    this.proceso='xml';
    let xml = 'http://devfactura.in/api/v3/cfdi33/' + id + '/xml';
    this.enviarfact.xml(id).subscribe(data => {
      localStorage.removeItem('xml')
      localStorage.setItem('xml',data)
      const blob = new Blob([data as BlobPart], { type: 'application/xml' });
      // this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
      this.fileUrl = window.URL.createObjectURL(blob);
      
      
      this.a.href = this.fileUrl;
      this.a.target = '_blank';
      this.a.download = 'F-'+folio+'.xml';
      
      document.body.appendChild(this.a);
//      console.log(this.fileUrl);
      // console.log(this.a);
      // console.log('blob:'+this.a.href);
      
      // this.a.click();
      this.xmlparam = localStorage.getItem('xml');
      this.resetForm();      
      // console.log(this.xmlparam);
      
      return this.fileUrl;

      // console.log(this.fileUrl);
      
      
    });

    
    
    

  }

  onExportClick(folio?:string) {
    this.proceso='xml';
    const content: Element = document.getElementById('element-to-PDF');

    const option = {
      
      margin: [0,0,0,0],
      filename: 'F-'+folio+'.pdf',
      image: {type: 'jpeg', quality: 1},
      html2canvas: {scale: 2, logging: true, scrollY: content.scrollHeight},
      jsPDF: {format: 'letter', orientation: 'portrait'}
    };

    html2pdf()
   .from(content)
   .set(option)
   .save();
   this.proceso='';
}

myCallback(pdf){
  localStorage.setItem('pdf',pdf);

}

  dpdfxml() {
    this.enviarfact.xml('http://devfactura.in/api/v3/cfdi33/5e06601d92802/xml')
      }


  setfacturatimbre(){
  
    this.json1 = {
      Receptor: {
        UID: ''
    },
    TipoDocumento: '',
    Conceptos: [{
        ClaveProdServ:'',
          NoIdentificacion:'',
          Cantidad:'',
          ClaveUnidad:'',
          Unidad:'',
          Descripcion:'',
          ValorUnitario:'',
          Importe:'',
          Descuento:'',
          tipoDesc:'',
          honorarioInverso:'',
          montoHonorario:'',
          Impuestos:{
            Traslados: [
              {
                Base: '',
                Impuesto: '',
                TipoFactor: '',
                TasaOCuota: '',
                Importe: ''
              }],
            Retenidos: [{
                Base: '',
                Impuesto: '',
                TipoFactor: '',
                TasaOCuota: '',
                Importe: ''
              }],
            Locales: [{
                Impuesto: '',
                TasaOCuota: '',
              }],
          },
          NumeroPedimento: '',
          Predial: '',
          Partes: '',
          Complemento:''
    }],
      Impuestos: {
          Traslados: 
          [{
            Base: '',
            Impuesto: '',
            TipoFactor: '',
            TasaOCuota: '',
            Importe: ''   
       }],
        Retenidos: [{
            Base: '',
            Impuesto: '',
            TipoFactor: '',
            TasaOCuota: '',
            Importe: '',
        }],
        Locales: [{
            Impuesto: '',
            TasaOCuota: '',  
       }]
      },
      CfdiRelacionados: {
              TipoRelacion: '',
              UUID: []
            },
      UsoCFDI: '',
      Serie: 0,
      FormaPago: '',
      MetodoPago: '',
      Moneda: '',
      EnviarCorreo: false,
    }
  }

  email(id: string, folio:string){

    let xml = 'http://devfactura.in/api/v3/cfdi33/' + id + '/xml';
    this.enviarfact.xml(id).subscribe(data => {
      const blob = new Blob([data as BlobPart], { type: 'application/xml' });
      // this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
      this.fileUrl = window.URL.createObjectURL(blob);
      
      
      this.a.href = this.fileUrl;
      this.a.target = '_blank';
      this.a.download = 'F-'+folio+'.xml';
      
      document.body.appendChild(this.a);
//      console.log(this.fileUrl);
      // console.log(this.a);
      // console.log('blob:'+this.a.href);
      
      //this.a.click();
      localStorage.removeItem('xml')
      localStorage.setItem('xml',data)
      this.xmlparam = localStorage.getItem('xml');


      const content: Element = document.getElementById('element-to-PDF');

    const option = {
      margin: [0,0,0,0],
      filename: 'F-'+folio+'.pdf',
      image: {type: 'jpeg', quality: 1},
      html2canvas: {scale: 2, logging: true, scrollY: content.scrollHeight},
      jsPDF: {format: 'letter', orientation: 'portrait'}


    };
    
    html2pdf().from(content).set(option).toPdf().output('datauristring').then(function (res) {
      // console.log(res);
      
      localStorage.setItem('pdf',res);
    })
  //  .save()






      this.resetForm();      
      // console.log(this.xmlparam);
      
      
      return this.fileUrl;

      // console.log(this.fileUrl);
      
      
    });









    // console.log('email');
    
    this._MessageService.sendMessage('form').subscribe(() => {
      Swal.fire("Form Enviado", "Mensaje enviado correctamente", "success");
    });
  }



  cancelar(id: string, folio:string) {
    console.log('cancelar');
    
  }  


}
