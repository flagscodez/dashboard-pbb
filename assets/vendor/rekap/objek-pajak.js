$(window).on('load', function () {
	  		$(function () {
		  		$('[data-toggle="tooltip"]').tooltip();
			});
					
			$(document).ready(function() {
			  $('.treeview-animated').mdbTreeview();
			  	$(document).ready(function() {
					$('#kecamatan').select2({
						placeholder: "Pilih Kecamatan",
						allowClear: true,
						width: '100%'   // supaya full lebar
					});
				});
			});
		  	
		});
		
		$(document).ready(function() {
			$('#kecamatan').on('change', function() {
				let nama = $(this).find(':selected').data('nama'); 
				$('#nm_kecamatan').val(nama);
			});

			let initNama = $('#kecamatan').find(':selected').data('nama');
			$('#nm_kecamatan').val(initNama);
		});

	var table;
    $(document).ready(function() {

        function reload_table () {
        	table.ajax.reload( null, false ); 
        }

        $(document).on("click", "#search", function() {
			const tahun 		= document.getElementById('tahun').value;
			const kec 			= document.getElementById('kecamatan').value;
			const nmkec 			= document.getElementById('nm_kecamatan').value;
			const ctipe			= 'prev';
			
			if (tahun == '') {
        		Swal.fire({
						  icon: 'warning',
						  title: 'PERHATIAN',
						  text: 'PILIH TAHUN TERLEBIH DAHULU',
						});
        	}else if(kec == '') {
        		Swal.fire({
						  icon: 'warning',
						  title: 'PERHATIAN',
						  text: 'PILIH KECAMATAN TERLEBIH DAHULU',
						});
        	}else{
        	
				$("#treeview-mdbootstrap").html(
					'<div id="loading-spinner" style="display:block; text-align:center; margin:10px;">'
						+ '<img src="assets/img/loading.gif" alt="Loading" height="135" width="135"><br>'
						+ '<span style="font-size:16px; color:#00809D;">Loading data...</span>'
					+ '</div>'
				);


				$.ajax({
					url: 'rekap-op-prev',
					type: 'POST',
					data: {
						tahun: tahun,
						kec: kec,
						nmkec: nmkec
					},
					success: function(data){
						$("#treeview-mdbootstrap").html(data);
					},
					error: function(xhr, status, error) {
						console.error("AJAX Error:", status, error);

						
						$("#treeview-mdbootstrap").html(`
							<div style="margin-top:50px;">
								<div class="alert alert-danger alert-dismissible" role="alert">
									<button type="button" class="close" data-dismiss="alert" aria-label="Close">
										<span aria-hidden="true">&times;</span>
									</button>
									<center><b>Peringatan!</b> Terjadi kesalahan saat mengambil data</center>
								</div>
							</div>
						`);


					}
				});


        	}

		  });
		  
		  

        $(document).on("click", ".tombol-print", function() {
			const tahun 		= document.getElementById('tahun').value;
			const kec 			= document.getElementById('kecamatan').value;
			const nmkec 			= document.getElementById('nm_kecamatan').value;
			const id 			= $(this).attr("id");
        	
        	if (tahun == '') {
        		Swal.fire({
						  icon: 'warning',
						  title: 'PERHATIAN',
						  text: 'PILIH TAHUN TERLEBIH DAHULU',
						});
        	}else if(kec == '') {
        		Swal.fire({
						  icon: 'warning',
						  title: 'PERHATIAN',
						  text: 'PILIH KECAMATAN TERLEBIH DAHULU',
						});
        	}else{
			  	if (id == 'print-pdf') {
                    window.open('rekap-op-pdf/' + tahun + '/' + kec + '/' + encodeURIComponent(nmkec) + '/pdf', '_blank');
	
			  	}else{
			  
                    window.open('rekap-op-excel/' + tahun + '/' + kec + '/' + encodeURIComponent(nmkec) + '/excel', '_blank');

                }
        	}

		  });

    });