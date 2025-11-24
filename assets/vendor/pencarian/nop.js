$(window).on('load', function () {
	  	$(function () {
		  	$('[data-toggle="tooltip"]').tooltip();
		});
	
	});


	var table;
    $(document).ready(function() {
        //datatables table
        table = $('#example1').DataTable({ 	
            "processing": true, 
            "serverSide": true, 
            "order": [], 
             
            "ajax": {
                "url": "cari-nop/getTable",
                "type": "POST"
            },
             
            "columnDefs": [
            { 
                "targets": [ 0,1,2,3,4,5,6,7,8 ], 
                "orderable": false, 
            }, { 
                "targets": [ 0,1,3,4 ],  "className": 'text-center',
            },
            ],
	
        });
       
        function reload_table () {
        	table.ajax.reload( null, false ); // user paging is not reset on reload
        }

        setInterval( function () {
		    table.ajax.reload( null, false ); // user paging is not reset on reload
		}, 20000 );


    });


$(document).on('click', '.btn-detail', function() {

    // buka modal
    $('#detailModal').modal('show');  

    // ambil data dari atribut
    var nop          = $(this).data('nop');
    var nama         = $(this).data('nama');
    var telp         = $(this).data('telp');
    var npwp         = $(this).data('npwp');
    var alamat       = $(this).data('alamat');
    var luasTanah    = $(this).data('luas_tanah');
    var luasBangunan = $(this).data('luas_bangunan');
    var alamat_op    = $(this).data('alamat_op');

    // isi modal
    $('#nop').text(nop);
    $('#nama_wp').text(nama);
    $('#telp').text(telp);
    $('#npwp').text(npwp);
    $('#alamat').text(alamat);
    $('#luas_tanah').text(luasTanah);
    $('#luas_bangunan').text(luasBangunan);
    $('#alamat_op').text(alamat_op);

});