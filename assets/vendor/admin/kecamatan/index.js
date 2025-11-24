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
                "url": "kecamatan/getTable",
                "type": "POST"
            },
             
            "columnDefs": [
            { 
                "targets": [ 0,1,2,3,4,5 ], 
                "orderable": false, 
            }, { 
                "targets": [ 0,1,2,5,6 ],  "className": 'text-center',
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
    var kode         = $(this).data('kd_kecamatan');
    var nama         = $(this).data('nm_kecamatan');
    var alamat       = $(this).data('alamat');
    var telp         = $(this).data('telp');
    var foto         = $(this).data('foto');

    // isi modal
    $('#kode').text(kode);
    $('#nm_kecamatan').text(nama);
    $('#alamat').text(alamat);
    $('#telp').text(telp);
    $('#foto').text(foto);
});


$(document).on("click", ".delete-data", function(e) {	
    e.preventDefault(); // cegah link <a> jalan

    var kode = $(this).attr("data-kode");
    var nama = $(this).attr("data-nama");

    Swal.fire({
        title: 'Apakah anda yakin?',
        text: "Menghapus Data " + kode + " : " + nama + "..?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#074979',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Batal',
        confirmButtonText: 'Ya, Hapus Data.'
    }).then((result) => {
        // kompatibel semua versi
        if (result.isConfirmed || result.value) { 
            
            $.ajax({
                type: 'POST',
                url: "kecamatan-delete",
                data: { kode: kode },
                dataType: "json"
            })
            .done(function(out) {
                if (out.status == 0) {
                    Swal.fire({
                        title: 'GAGAL HAPUS',	
                        position: 'top-center',
                        icon: 'warning',
                        text: 'Gagal Hapus Data!',
                        showConfirmButton: false,
                        timer: 2000
                    });
                } else {
                    Swal.fire({
                        position: 'top-center',
                        icon: 'success',
                        title: 'Data Berhasil Di Hapus!',
                        showConfirmButton: false,
                        timer: 2000
                    });
                    window.location.reload();
                }
            })
            .fail(function(xhr, status, error) {
                console.error("AJAX Error:", status, error);
                console.log(xhr.responseText);
                Swal.fire("Error", "Terjadi kesalahan AJAX!", "error");
            });
        }
    });
});


