$(window).on('load', function () {
  		$(function () {
	  		$('[data-toggle="tooltip"]').tooltip();
			 
		});
				
		$(document).ready(function() {
		  get_penerimaan_kecamatan('000');	
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


	$(document).ready(function () {
		// event onchange
		$('#kecamatan').on('change', function () {
			var kec = $(this).val();
			get_penerimaan_kecamatan(kec);
		});
	});	


	$('#tipe_chart').on('change', function() {
		let kec = $('#kecamatan').val();
		get_penerimaan_kecamatan(kec);
	})

	$('#btn-tampil').on('click', function() {
		let kec = $('#kecamatan').val();
		get_penerimaan_kecamatan(kec);
	})

	function formatToYMD(dateStr) {
		const parts = dateStr.split('-'); 
		const d = new Date(parts[2], parts[1] - 1, parts[0]); 
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}


	function get_penerimaan_kecamatan_lama(kec) {
		$('#loading-spinner').show();
		$('#container-penerimaan').empty();

		const _startDate = document.getElementById('start_date').value;
		const _endDate   = document.getElementById('end_date').value;
		const startDate  = formatToYMD(_startDate);
		const endDate    = formatToYMD(_endDate);

		$.ajax({
			url: 'chart-penerimaan/get/' + encodeURIComponent(kec),
			type: 'POST',
			data: { startDate, endDate },
			success: function (data) {
				let out = {};
				try {
					out = jQuery.parseJSON(data) || {};
				} catch (e) {
					console.error('JSON parse error:', e, data);
					$('#container-penerimaan').html("<p style='color:red;text-align:center;'>Data tidak Ditemukan</p>");
					return;
				}

				const namaGroup = out.group || [];
				const pokok     = (out.pokok || []).map(v => Number(v) || 0);
				const denda     = (out.denda || []).map(v => Number(v) || 0);
				const jumlah    = (out.jumlah || []).map(v => Number(v) || 0);
				const nama      = out.nama || [];

				if (!namaGroup.length) {
					$('#container-penerimaan').html(`
						<div class="alert alert-info text-center" role="alert">
							<b>Informasi:</b> Tidak ditemukan data untuk periode ini
						</div>
					`);
					return;
				}

				const cjudul = (kec === '000') 
					? 'Penerimaan PBB Kabupaten Bulungan'
					: 'Penerimaan PBB Kecamatan ' + nama;

				const periode = `${document.getElementById('start_date').value} s/d ${document.getElementById('end_date').value}`;
				var tipeChart = $('#tipe_chart').val();
				let seriesData = [];

				if (tipeChart === 'pie') {
					namaGroup.forEach(function(nm, i) {
						seriesData.push({ name: nm, y: pokok[i] + denda[i] });
					});
				}

				// ==== Hitung total keseluruhan ====
				const totalPokok  = pokok.reduce((a, b) => a + b, 0);
				const totalDenda  = denda.reduce((a, b) => a + b, 0);
				const totalJumlah = jumlah.reduce((a, b) => a + b, 0);

				const formatRupiah = (num) => 'Rp ' + Highcharts.numberFormat(num, 0, ',', '.');

				$('#container-penerimaan').append(`
					<div id="chart-penerimaan" style="width:100%; height:500px;"></div>
					<div id="summary-penerimaan" style="margin-top:25px;"></div>
				`);

				Highcharts.chart('chart-penerimaan', {
					chart: {
						type: tipeChart,
						backgroundColor: 'transparent',
						style: { fontFamily: 'Segoe UI, Roboto, sans-serif' }
					},
					title: {
						text: `${cjudul}<br><p style="text-align:center; margin:0;">Periode ${periode}</p>`,
						useHTML: true,
						align: 'center',
						style: { fontSize: '18px', fontWeight: 'bold', color: '#00707a' }
					},
					xAxis: {
						categories: namaGroup,
						crosshair: true,
						labels: { style: { fontWeight: 'bold' } }
					},
					yAxis: {
						title: { text: 'Nilai (Rp)', style: { color: '#00707a', fontWeight: 'bold' } },
						labels: {
							formatter: function() { return 'Rp ' + Highcharts.numberFormat(this.value, 0, ',', '.'); }
						},
						gridLineDashStyle: 'ShortDash'
					},
					tooltip: {
						shared: true,
						backgroundColor: 'rgba(255,255,255,0.95)',
						borderColor: '#00707a',
						useHTML: true,
						formatter: function () {
							let s = `<b>${this.x}</b><br/>`;
							this.points.forEach(p => {
								s += `<span style="color:${p.color}">●</span> ${p.series.name}: <b>Rp ${Highcharts.numberFormat(p.y, 0, ',', '.')}</b><br/>`;
							});
							return s;
						}
					},
					plotOptions: {
						column: {
							borderRadius: 5,
							dataLabels: {
								enabled: true,
								formatter: function() {
									return 'Rp ' + Highcharts.numberFormat(this.y, 0, ',', '.');
								},
								style: { fontSize: '10px' }
							}
						},
						line: {
							dataLabels: {
								enabled: true,
								align: 'center',
								verticalAlign: 'bottom',
								y: -15,
								formatter: function() {
									return 'Rp ' + Highcharts.numberFormat(this.y, 0, ',', '.');
								},
								style: {
									fontSize: '11px',
									fontWeight: 'bold',
									color: '#2ca02c',
									textOutline: 'none'
								}
							},
							marker: {
								symbol: 'circle',
								radius: 5,
								fillColor: '#2ca02c',
								lineWidth: 1,
								lineColor: '#1c7430'
							}
						},
						series: { animation: { duration: 800 } }
					},
					colors: ['#1f77b4', '#ff7f0e', '#2ca02c'],
					legend: { align: 'center', verticalAlign: 'bottom', itemStyle: { fontWeight: 'bold' } },
					credits: { enabled: false },
					series: [
						{ name: 'Pokok Penerimaan', data: pokok, type: 'column' },
						{ name: 'Denda Penerimaan', data: denda, type: 'column' },
						{ 
							name: 'Total Penerimaan', 
							data: jumlah, 
							type: 'line',
							zIndex: 5,
							color: '#2ca02c'
						}
					]
				});

				// ==== Tampilan total di bawah grafik ====
				$('#summary-penerimaan').html(`
					<div class="row text-center" style="gap:10px; justify-content:center;">
						<div class="col-md-3 col-6 shadow-sm p-3 rounded-3" style="background:linear-gradient(135deg,#e3f2fd,#ffffff);">
							<i class="fa fa-file-invoice fa-2x text-primary mb-2"></i>
							<h6 class="mb-1" style="font-weight:600;color:#0d47a1;">Pokok Penerimaan</h6>
							<h5 style="color:#0d47a1;">${formatRupiah(totalPokok)}</h5>
						</div>
						<div class="col-md-3 col-6 shadow-sm p-3 rounded-3" style="background:linear-gradient(135deg,#fff3e0,#ffffff);">
							<i class="fa fa-coins fa-2x text-warning mb-2"></i>
							<h6 class="mb-1" style="font-weight:600;color:#ef6c00;">Denda Penerimaan</h6>
							<h5 style="color:#ef6c00;">${formatRupiah(totalDenda)}</h5>
						</div>
						<div class="col-md-4 col-8 shadow-sm p-3 rounded-3" style="background:linear-gradient(135deg,#e8f5e9,#ffffff);">
							<i class="fa fa-hand-holding-usd fa-2x text-success mb-2"></i>
							<h6 class="mb-1" style="font-weight:600;color:#2e7d32;">Total Penerimaan</h6>
							<h5 style="color:#2e7d32;">${formatRupiah(totalPokok+totalDenda)}</h5>
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

function get_penerimaan_kecamatan(kec) {
	$('#loading-spinner').show();
	$('#container-penerimaan').empty();

	const _startDate = document.getElementById('start_date').value;
	const _endDate   = document.getElementById('end_date').value;
	const startDate  = formatToYMD(_startDate);
	const endDate    = formatToYMD(_endDate);

	$.ajax({
		url: 'chart-penerimaan/get/' + encodeURIComponent(kec),
		type: 'POST',
		data: { startDate, endDate },
		success: function (data) {
			let out = {};
			try {
				out = jQuery.parseJSON(data) || {};
			} catch (e) {
				console.error('JSON parse error:', e, data);
				$('#container-penerimaan').html("<p style='color:red;text-align:center;'>Data tidak Ditemukan</p>");
				return;
			}

			const namaGroup = out.group || [];
			const pokok     = (out.pokok || []).map(v => Number(v) || 0);
			const denda     = (out.denda || []).map(v => Number(v) || 0);
			const jumlah    = (out.jumlah || []).map(v => Number(v) || 0);
			const nama      = out.nama || [];

			if (!namaGroup.length) {
				$('#container-penerimaan').html(`
					<div class="alert alert-info text-center" role="alert">
						<b>Informasi:</b> Tidak ditemukan data untuk periode ini
					</div>
				`);
				return;
			}

			const cjudul = (kec === '000') 
				? 'Penerimaan PBB Kabupaten Bulungan'
				: 'Penerimaan PBB Kecamatan ' + nama;

			const periode = `${_startDate} s/d ${_endDate}`;
			const tipeChart = $('#tipe_chart').val();

			// ==== Hitung total keseluruhan ====
			const totalPokok  = pokok.reduce((a, b) => a + b, 0);
			const totalDenda  = denda.reduce((a, b) => a + b, 0);
			const totalJumlah = jumlah.reduce((a, b) => a + b, 0);
			const formatRupiah = (num) => 'Rp ' + Highcharts.numberFormat(num, 0, ',', '.');

			// ==== Siapkan data series berdasarkan tipe chart ====
			let seriesOptions = [];
			let chartType = tipeChart;

			if (tipeChart === 'pie') {
				const seriesData = namaGroup.map((nm, i) => ({
					name: nm,
					y: (pokok[i] || 0) + (denda[i] || 0)
				}));
				seriesOptions = [{
					name: 'Total Penerimaan',
					colorByPoint: true,
					data: seriesData
				}];
			} 
			else if (tipeChart === 'area') {
				seriesOptions = [
					{ name: 'Pokok Penerimaan', data: pokok, type: 'area', fillOpacity: 0.5 },
					{ name: 'Denda Penerimaan', data: denda, type: 'area', fillOpacity: 0.5 },
					{ name: 'Total Penerimaan', data: jumlah, type: 'line', color: '#2ca02c', zIndex: 5 }
				];
			} 
			else if (tipeChart === 'line') {
				seriesOptions = [
					{ name: 'Pokok Penerimaan', data: pokok, type: 'line' },
					{ name: 'Denda Penerimaan', data: denda, type: 'line' },
					{ name: 'Total Penerimaan', data: jumlah, type: 'line', color: '#2ca02c', zIndex: 5 }
				];
			} else if (tipeChart === 'bar') {
				seriesOptions = [
					{ name: 'Pokok Penerimaan', data: pokok, type: 'bar' },
					{ name: 'Denda Penerimaan', data: denda, type: 'bar' },
					{ name: 'Total Penerimaan', data: jumlah, type: 'line', color: '#2ca02c', zIndex: 5 }
				];
			} 
			else {
				chartType = 'column';
				seriesOptions = [
					{ name: 'Pokok Penerimaan', data: pokok, type: 'column' },
					{ name: 'Denda Penerimaan', data: denda, type: 'column' },
					{ name: 'Total Penerimaan', data: jumlah, type: 'line', color: '#2ca02c', zIndex: 5 }
				];
			}

			// ==== Tempatkan chart dan summary ====
			$('#container-penerimaan').append(`
				<div id="chart-penerimaan" style="width:100%; height:500px;"></div>
				<div id="summary-penerimaan" style="margin-top:25px;"></div>
			`);

			// ==== Render Highcharts ====
			Highcharts.chart('chart-penerimaan', {
				chart: {
					type: chartType,
					backgroundColor: 'transparent',
					style: { fontFamily: 'Segoe UI, Roboto, sans-serif' }
				},
				title: {
					text: `${cjudul}<br><p style="text-align:center; margin:0;">Periode ${periode}</p>`,
					useHTML: true,
					align: 'center',
					style: { fontSize: '18px', fontWeight: 'bold', color: '#00707a' }
				},
				xAxis: (tipeChart === 'pie') ? null : {
					categories: namaGroup,
					crosshair: true,
					labels: { style: { fontWeight: 'bold' } }
				},
				yAxis: (tipeChart === 'pie') ? null : {
					title: { text: 'Nilai (Rp)', style: { color: '#00707a', fontWeight: 'bold' } },
					labels: {
						formatter: function() { return 'Rp ' + Highcharts.numberFormat(this.value, 0, ',', '.'); }
					},
					gridLineDashStyle: 'ShortDash'
				},
				tooltip: {
					shared: true,
					backgroundColor: 'rgba(255,255,255,0.95)',
					borderColor: '#00707a',
					useHTML: true,
					formatter: function () {
						if (tipeChart === 'pie') {
							return `<b>${this.point.name}</b>: Rp ${Highcharts.numberFormat(this.point.y, 0, ',', '.')}`;
						}
						let s = `<b>${this.x}</b><br/>`;
						this.points.forEach(p => {
							s += `<span style="color:${p.color}">●</span> ${p.series.name}: <b>Rp ${Highcharts.numberFormat(p.y, 0, ',', '.')}</b><br/>`;
						});
						return s;
					}
				},
				plotOptions: {
					column: {
						borderRadius: 5,
						dataLabels: {
							enabled: true,
							formatter: function() {
								return 'Rp ' + Highcharts.numberFormat(this.y, 0, ',', '.');
							},
							style: { fontSize: '10px' }
						}
					},
					line: {
						dataLabels: {
							enabled: true,
							formatter: function() {
								return 'Rp ' + Highcharts.numberFormat(this.y, 0, ',', '.');
							},
							style: { fontSize: '11px', fontWeight: 'bold', color: '#2ca02c', textOutline: 'none' }
						}
					},
					pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						dataLabels: {
							enabled: true,
							format: '<b>{point.name}</b>: {point.percentage:.1f} %',
							style: { fontSize: '11px' }
						},
						showInLegend: true
					},
					series: { animation: { duration: 800 } }
				},
				colors: ['#1f77b4', '#ff7f0e', '#2ca02c'],
				legend: { align: 'center', verticalAlign: 'bottom', itemStyle: { fontWeight: 'bold' } },
				credits: { enabled: false },
				series: seriesOptions
			});

			// ==== Ringkasan total di bawah chart ====
			$('#summary-penerimaan').html(`
				<div class="row text-center" style="gap:10px; justify-content:center;">
					<div class="col-md-3 col-6 shadow-sm p-3 rounded-3" style="background:linear-gradient(135deg,#e3f2fd,#ffffff);">
						<i class="fa fa-file-invoice fa-2x text-primary mb-2"></i>
						<h6 class="mb-1" style="font-weight:600;color:#0d47a1;">Pokok Penerimaan</h6>
						<h5 style="color:#0d47a1;">${formatRupiah(totalPokok)}</h5>
					</div>
					<div class="col-md-3 col-6 shadow-sm p-3 rounded-3" style="background:linear-gradient(135deg,#fff3e0,#ffffff);">
						<i class="fa fa-coins fa-2x text-warning mb-2"></i>
						<h6 class="mb-1" style="font-weight:600;color:#ef6c00;">Denda Penerimaan</h6>
						<h5 style="color:#ef6c00;">${formatRupiah(totalDenda)}</h5>
					</div>
					<div class="col-md-4 col-8 shadow-sm p-3 rounded-3" style="background:linear-gradient(135deg,#e8f5e9,#ffffff);">
						<i class="fa fa-hand-holding-usd fa-2x text-success mb-2"></i>
						<h6 class="mb-1" style="font-weight:600;color:#2e7d32;">Total Penerimaan</h6>
						<h5 style="color:#2e7d32;">${formatRupiah(totalPokok + totalDenda)}</h5>
					</div>
				</div>
			`);
		},
		complete: function() { $('#loading-spinner').hide(); },
		error: function() {
			$('#container-penerimaan').html("<p style='color:red;text-align:center;'>Gagal memuat data</p>");
			$('#loading-spinner').hide();
		}
	});
}



    function formatTanggalIndonesia(dateStr) {
        const bulan = ["Januari","Februari","Maret","April","Mei","Juni",
                    "Juli","Agustus","September","Oktober","November","Desember"];
        const d = new Date(dateStr);
        const hari = d.getDate();
        const bln = bulan[d.getMonth()];
        const thn = d.getFullYear();
        return `${hari} ${bln} ${thn}`;
    }
    
	
    

