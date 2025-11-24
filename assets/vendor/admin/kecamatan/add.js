function previewImage(event) {
    var reader = new FileReader();
    reader.onload = function(){
        var output = document.getElementById('previewFoto');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

var coll = document.getElementsByClassName("collapsible-form");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active-form");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}


$(document).ready(function() {
	  $('textarea').on('keyup keypress', function() {
	    $(this).height(0);
	    $(this).height(this.scrollHeight);
	  });
	  // The date picker (read the docs)
		
	});
	



$(document).on("click", ".simpan-data", function(e) {
	var data = $('#form-kecamatan').serialize();

	var kd_kecamatan = $('#kd_kecamatan').val();
	var nm_kecamatan = $('#nm_kecamatan').val();
	var telp = $('#telp').val();
	var alamat = $('#alamat').val();
	// var foto = $('#previewFoto').val();
	var foto = $('#previewFoto').attr('src');
	if (foto.startsWith("data:image")) {
		foto = foto.split(',')[1]; 
	}
	
	

	if (kd_kecamatan == '') {
		Swal.fire({position: 'top-end',icon: 'warning',title: 'Kode Kecamatan Tidak boleh Kosong',showConfirmButton: false,timer: 2000});
		exit();
	}else if (nm_kecamatan == '') {
		Swal.fire({position: 'top-end',icon: 'warning',title: 'Nama Kecamatan Tidak boleh Kosong',showConfirmButton: false,timer: 2000});
		exit();
	}



	var aksi = $(this).attr('data-aksi');
	$.ajax({
		
	url: 'kecamatan-insert',
	type: 'POST',
	data: ({kd_kecamatan: kd_kecamatan,
			nm_kecamatan: nm_kecamatan,
			telp: telp,
			alamat: alamat,
			foto: foto 
	}),
	dataType: "json",
		success: function(data) {	
						if(data==0){
							pesan="Data Gagal Simpan";
								Swal.fire({
								  position: 'top-end',
								  icon: 'error',
								  title: pesan,
								  showConfirmButton: false,
								  timer: 2000
								});
							}else{
							
							pesan="File Berhasil Di Simpan";

							Swal.fire({
							  position: 'top-end',
							  icon: 'success',
							  title: pesan,
							  showConfirmButton: false,
							  timer: 2000
							});							
								
							exit();
                            	

						}
					 }
	
	});
	
	

	e.preventDefault();
});

function deleteRow(btn) {
	var row = btn.parentNode.parentNode;
	row.parentNode.removeChild(row);
}