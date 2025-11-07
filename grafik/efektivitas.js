	$(window).on('load', function () {
  		$(function () {
	  		$('[data-toggle="tooltip"]').tooltip();
			 
		});
				// Treeview Initialization
		$(document).ready(function() {
		  get_efektivitas_kab('000');	
		  $('.treeview-animated').mdbTreeview();

			$(function(){
				$("#start_year").datepicker({
					format: "yyyy",           // tampilkan tahun saja
					viewMode: "years",        // tampilan awal daftar tahun
					minViewMode: "years",     // hanya bisa memilih tahun
					autoclose: true
				});
			});

			$(function(){
				$("#end_year").datepicker({
					format: "yyyy",
					viewMode: "years",
					minViewMode: "years",
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


	$(document).ready(function () {
		// event onchange
		$('#kecamatan').on('change', function () {
			var kec = $(this).val();
			get_efektivitas_kab(kec);
		});
	});	


	$('#tipe_chart').on('change', function() {
		let kec = $('#kecamatan').val();
		get_efektivitas_kab(kec);
	})

	$('#btn-tampil').on('click', function() {
		let kec = $('#kecamatan').val();
		get_efektivitas_kab(kec);
	})



function get_efektivitas_kab_asli(kec) {
	$('#loading-spinner').show();
	$('#container-penerimaan').empty();

	const startYear = document.getElementById('start_year').value;
	const endYear   = document.getElementById('end_year').value;

	$.ajax({
		url: 'chart-efektivitas/get/' + encodeURIComponent(kec),
		type: 'POST',
		data: { startYear, endYear },
		success: function (data) {
			let out = {};
			try {
				out = jQuery.parseJSON(data) || {};
			} catch (e) {
				console.error('JSON parse error:', e, data);
				$('#container-penerimaan').html("<p style='color:red;text-align:center;'>Data tidak Ditemukan</p>");
				return;
			}

			let namaGroup   = out.group || [];
			let sppt_tetap  = (out.sppt_tetap || []).map(v => Number(v) || 0);
			let sppt_real   = (out.sppt_real || []).map(v => Number(v) || 0);
			let nilai_tetap = (out.nilai_tetap || []).map(v => Number(v) || 0);
			let nilai_real  = (out.nilai_real || []).map(v => Number(v) || 0);
			let nama	    = out.nama || [];

			if (!namaGroup.length) {
				$('#container-penerimaan').html(`
					<div class="alert alert-info alert-dismissible" role="alert">
						<button type="button" class="close" data-dismiss="alert" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
						<center><b>Informasi</b> Tidak ditemukan data untuk periode ini</center>
					</div>
				`);
				return;
			}

			let cjudul = (kec === '000') 
				? 'Efektivitas Realisasi PBB Kabupaten Bulungan'
				: 'Efektivitas Realisasi PBB Kecamatan '+nama;

			let periode = startYear + ' s/d ' + endYear;
			let tipeChart = $('#tipe_chart').val() || 'column';

			$('#container-penerimaan').append(`
				<div id="chart-efektivitas" style="width:100%; height:500px;"></div>
			`);

			Highcharts.chart('chart-efektivitas', {
				chart: {
					type: tipeChart,
					backgroundColor: '#ffffff',
					style: { fontFamily: 'Segoe UI, Roboto, sans-serif' }
				},
				title: {
					text: `${cjudul}<br><p style="text-align:center; margin:0;">Periode ${periode}</p>`,
					useHTML: true,
					align: 'center',
					style: { fontSize:'17px', fontWeight:'bold', color:'#00707a' }
				},
				xAxis: { categories: namaGroup },
				yAxis: [
					{ // Primary Y-axis — SPPT
						labels: { format: '{value}', style: { color: '#1f77b4' } },
						title: { text: 'Jumlah SPPT', style: { color: '#1f77b4', fontWeight: 'bold' } }
					}, 
					{ // Secondary Y-axis — Nilai (Rp)
						labels: { 
							format: 'Rp {value:,.0f}', 
							style: { color: '#2ca02c' } 
						},
						title: { text: 'Nilai Pajak (Rp)', style: { color: '#2ca02c', fontWeight: 'bold' } },
						opposite: true
					}
				],
				tooltip: {
					shared: true,
					formatter: function() {
						let s = `<b>${this.x}</b><br/>`;
						this.points.forEach(p => {
							let label = (p.series.userOptions.axisType === 'nilai') ? 
								`Rp ${Highcharts.numberFormat(p.y,0,',','.')}` : 
								Highcharts.numberFormat(p.y,0,',','.');
							s += `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${label}</b><br/>`;
						});
						return s;
					}
				},
				plotOptions: {
					column: { borderRadius: 4, dataLabels: { enabled: true } },
					line: { dataLabels: { enabled: true } },
					area: { dataLabels: { enabled: true }, fillOpacity: 0.3 }
				},
				colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'],
				legend: { align: 'center', verticalAlign: 'bottom' },
				credits: { enabled: false },
				series: [
					{ name: 'SPPT Tetap (Target)', data: sppt_tetap, yAxis: 0, axisType: 'sppt', type: 'column' },
					{ name: 'SPPT Realisasi', data: sppt_real, yAxis: 0, axisType: 'sppt', type: 'column' },
					{ name: 'Nilai Tetap (Target)', data: nilai_tetap, yAxis: 1, axisType: 'nilai', type: 'line', marker: { symbol: 'circle' } },
					{ name: 'Nilai Realisasi', data: nilai_real, yAxis: 1, axisType: 'nilai', type: 'line', marker: { symbol: 'diamond' } }
				]
			});
		},
		complete: function(){ $('#loading-spinner').hide(); },
		error: function(){ 
			$('#container-penerimaan').html("<p style='color:red;text-align:center;'>Gagal memuat data</p>"); 
		}
	});
}


function get_efektivitas_kab(kec) {
	$('#loading-spinner').show();
	$('#container-penerimaan').empty();

	const startYear = document.getElementById('start_year').value;
	const endYear   = document.getElementById('end_year').value;

	$.ajax({
		url: 'chart-efektivitas/get/' + encodeURIComponent(kec),
		type: 'POST',
		data: { startYear, endYear },
		success: function (data) {
			let out = {};
			try {
				out = jQuery.parseJSON(data) || {};
			} catch (e) {
				console.error('JSON parse error:', e, data);
				$('#container-penerimaan').html("<p style='color:red;text-align:center;'>Data tidak Ditemukan</p>");
				return;
			}

			let namaGroup   = out.group || [];
			let sppt_tetap  = (out.sppt_tetap || []).map(v => Number(v) || 0);
			let sppt_real   = (out.sppt_real || []).map(v => Number(v) || 0);
			let nilai_tetap = (out.nilai_tetap || []).map(v => Number(v) || 0);
			let nilai_real  = (out.nilai_real || []).map(v => Number(v) || 0);
			let nama	    = out.nama || [];

			if (!namaGroup.length) {
				$('#container-penerimaan').html(`
					<div class="alert alert-info alert-dismissible" role="alert">
						<button type="button" class="close" data-dismiss="alert" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
						<center><b>Informasi</b> Tidak ditemukan data untuk periode ini</center>
					</div>
				`);
				return;
			}

			let cjudul = (kec === '000') 
				? 'Efektivitas Realisasi PBB Kabupaten Bulungan'
				: 'Efektivitas Realisasi PBB Kecamatan ' + nama;

			let periode = startYear + ' s/d ' + endYear;
			let tipeChart = $('#tipe_chart').val() || 'column';

			$('#container-penerimaan').append(`
				<div id="chart-efektivitas" style="width:100%; height:500px;"></div>
				<div id="total-summary" style="margin-top:25px;"></div>
			`);

			// ==== HITUNG TOTAL ====
			let total_sppt_tetap  = sppt_tetap.reduce((a,b) => a + b, 0);
			let total_sppt_real   = sppt_real.reduce((a,b) => a + b, 0);
			let total_nilai_tetap = nilai_tetap.reduce((a,b) => a + b, 0);
			let total_nilai_real  = nilai_real.reduce((a,b) => a + b, 0);

			// ==== FORMAT ANGKA ====
			const formatAngka = (num) => Highcharts.numberFormat(num, 0, ',', '.');
			const formatRupiah = (num) => 'Rp ' + Highcharts.numberFormat(num, 0, ',', '.');

			// ==== TAMPILKAN CHART ====
			Highcharts.chart('chart-efektivitas', {
				chart: {
					type: tipeChart,
					backgroundColor: '#ffffff',
					style: { fontFamily: 'Segoe UI, Roboto, sans-serif' }
				},
				title: {
					text: `${cjudul}<br><p style="text-align:center; margin:0;">Periode ${periode}</p>`,
					useHTML: true,
					align: 'center',
					style: { fontSize:'17px', fontWeight:'bold', color:'#00707a' }
				},
				xAxis: { categories: namaGroup },
				yAxis: [
					{
						labels: { format: '{value}', style: { color: '#1f77b4' } },
						title: { text: 'Jumlah SPPT', style: { color: '#1f77b4', fontWeight: 'bold' } }
					}, 
					{
						labels: { format: 'Rp {value:,.0f}', style: { color: '#2ca02c' } },
						title: { text: 'Nilai Pajak (Rp)', style: { color: '#2ca02c', fontWeight: 'bold' } },
						opposite: true
					}
				],
				tooltip: {
					shared: true,
					formatter: function() {
						let s = `<b>${this.x}</b><br/>`;
						this.points.forEach(p => {
							let label = (p.series.userOptions.axisType === 'nilai') ? 
								`Rp ${Highcharts.numberFormat(p.y,0,',','.')}` : 
								Highcharts.numberFormat(p.y,0,',','.');
							s += `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${label}</b><br/>`;
						});
						return s;
					}
				},
				plotOptions: {
					column: { borderRadius: 5, dataLabels: { enabled: true } },
					line: { dataLabels: { enabled: true } },
					area: { dataLabels: { enabled: true }, fillOpacity: 0.3 }
				},
				colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'],
				legend: { align: 'center', verticalAlign: 'bottom' },
				credits: { enabled: false },
				series: [
					{ name: 'SPPT Tetap (Target)', data: sppt_tetap, yAxis: 0, axisType: 'sppt', type: 'column' },
					{ name: 'SPPT Realisasi', data: sppt_real, yAxis: 0, axisType: 'sppt', type: 'column' },
					{ name: 'Nilai Tetap (Target)', data: nilai_tetap, yAxis: 1, axisType: 'nilai', type: 'line', marker: { symbol: 'circle' } },
					{ name: 'Nilai Realisasi', data: nilai_real, yAxis: 1, axisType: 'nilai', type: 'line', marker: { symbol: 'diamond' } }
				]
			});

			$('#total-summary').html(`
				<div class="row text-center" style="gap:10px; justify-content:center;">
					<div class="col-md-2 col-5 shadow-sm p-3 rounded-3" style="background:linear-gradient(135deg,#e3f2fd,#ffffff);">
						<i class="fa fa-file-alt fa-2x text-primary mb-2"></i>
						<h6 class="mb-1" style="font-weight:600;color:#0d47a1;">SPPT Tetap</h6>
						<h5 style="color:#0d47a1;">${formatAngka(total_sppt_tetap)}</h5>
					</div>
					<div class="col-md-2 col-5 shadow-sm p-3 rounded-3" style="background:linear-gradient(135deg,#fff3e0,#ffffff);">
						<i class="fa fa-file-invoice-dollar fa-2x text-warning mb-2"></i>
						<h6 class="mb-1" style="font-weight:600;color:#ef6c00;">SPPT Realisasi</h6>
						<h5 style="color:#ef6c00;">${formatAngka(total_sppt_real)}</h5>
					</div>
					<div class="col-md-3 col-6 shadow-sm p-3 rounded-3" style="background:linear-gradient(135deg,#e8f5e9,#ffffff);">
						<i class="fa fa-coins fa-2x text-success mb-2"></i>
						<h6 class="mb-1" style="font-weight:600;color:#2e7d32;">Nilai Tetap</h6>
						<h5 style="color:#2e7d32;">${formatRupiah(total_nilai_tetap)}</h5>
					</div>
					<div class="col-md-3 col-6 shadow-sm p-3 rounded-3" style="background:linear-gradient(135deg,#ffebee,#ffffff);">
						<i class="fa fa-hand-holding-usd fa-2x text-danger mb-2"></i>
						<h6 class="mb-1" style="font-weight:600;color:#c62828;">Nilai Realisasi</h6>
						<h5 style="color:#c62828;">${formatRupiah(total_nilai_real)}</h5>
					</div>
				</div>
			`);
		},
		complete: function(){ $('#loading-spinner').hide(); },
		error: function(){ 
			$('#container-penerimaan').html("<p style='color:red;text-align:center;'>Gagal memuat data</p>"); 
		}
	});
}