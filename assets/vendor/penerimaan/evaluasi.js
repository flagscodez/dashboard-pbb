	$(window).on('load', function () {
	  		$(function () {
		  		$('[data-toggle="tooltip"]').tooltip();
			});
					
			$(document).ready(function() {
			  $('.treeview-animated').mdbTreeview();


				$(function(){
					$("#start_date").datepicker({
						format: "dd-mm-yyyy",   
						autoclose: true
					});
				});

				$(function(){
					$("#end_date").datepicker({
						format: "dd-mm-yyyy",   
						autoclose: true
					});
				});

				$(document).ready(function() {
					$('#kecamatan').select2({
						placeholder: "Pilih Kecamatan",
						allowClear: true,
						width: '100%'   // supaya full lebar
					});
				});



			});
		  	
		});
		
	var table;
    $(document).ready(function() {

        function reload_table () {
        	table.ajax.reload( null, false ); 
        }

        $(document).on("click", "#search", function() {
			const tahun = document.getElementById('tahun').value;
			const kecamatan = document.getElementById('kecamatan').value;
			const startDate = document.getElementById('start_date').value;
			const endDate = document.getElementById('end_date').value;
			const ctipe			= 'prev';
			
			if (startDate == '') {
        		Swal.fire({
						  icon: 'warning',
						  title: 'PERHATIAN',
						  text: 'PILIH PERIODE AWAL TERLEBIH DAHULU',
						});
        	}else if(endDate == '') {
        		Swal.fire({
						  icon: 'warning',
						  title: 'PERHATIAN',
						  text: 'PILIH PERIODE AKHIR TERLEBIH DAHULU',
						});
        	}else{
        	
				$("#treeview-mdbootstrap").html(
					'<div id="loading-spinner" style="display:block; text-align:center; margin:20px;">'
						+ '<img src="assets/img/loading.gif" alt="Loading" height="135" width="135"><br>'
						+ '<span style="font-size:16px; color:#00809D;">Loading data...</span>'
					+ '</div>'
				);


				$.ajax({
					url: 'evaluasi-penerimaan-prev',
					type: 'POST',
					data: {
						tahun: tahun,
						kecamatan: kecamatan,
						startDate: startDate,
						endDate: endDate
					},
					success: function(data){
						$("#treeview-mdbootstrap").html(data);
					},
					error: function(xhr, status, error) {
						console.error("AJAX Error:", status, error);
						$("#treeview-mdbootstrap").html("<p style='color:red;'>Terjadi kesalahan saat mengambil data.</p>");
					}
				});


        	}

		  });
		  
		  

        $(document).on("click", ".tombol-print", function() {
			const tahun = document.getElementById('tahun').value;
			const kecamatan = document.getElementById('kecamatan').value;
			const startDate = document.getElementById('start_date').value;
			const endDate = document.getElementById('end_date').value;
			const id 			= $(this).attr("id");
        	
        	if (startDate == '') {
        		Swal.fire({
						  icon: 'warning',
						  title: 'PERINGATAN!',
						  text: 'PERIODE AWAL TIDAK BOLEH KOSONG',
						});
        	}else if (endDate == '') {
        		Swal.fire({
						  icon: 'warning',
						  title: 'PERINGATAN!',
						  text: 'PERIODE AKHIR TIDAK BOLEH KOSONG',
						});
        	}else{

				if (id == 'print-pdf') {
					window.open('evaluasi-penerimaan-pdf/' + tahun + '/' + encodeURIComponent(kecamatan) + '/' + startDate + '/' + endDate + '/pdf', '_blank');
				} else {
					window.open('evaluasi-penerimaan-excel/' + tahun + '/' + encodeURIComponent(kecamatan) + '/' + startDate + '/' + endDate + '/excel', '_blank');
				}

        	}

		  });

    });