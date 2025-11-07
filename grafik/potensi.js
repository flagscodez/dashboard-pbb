$(window).on('load', function () {
  		$(function () {
	  		$('[data-toggle="tooltip"]').tooltip();
			 
		});
				
		$(document).ready(function() {
		  get_potensi_kecamatan('000');	
		  $('.treeview-animated').mdbTreeview();
		 
		});

	});


	$(document).ready(function () {
		// event onchange
		$('#kecamatan').on('change', function () {
			var kec = $(this).val();
			get_potensi_kecamatan(kec);
		});
	});	


function get_penerimaan_kecamatan(kec) {
    $('#loading-spinner').show();
    $('#container-penerimaan').empty();

    $.ajax({
        url: 'chart-penerimaan/get/' + encodeURIComponent(kec),
        type: 'POST',
        success: function (data) {
            var out   = jQuery.parseJSON(data);
            var namaGroup = out.group || [];
            var pokok     = out.pokok || [];
            var denda     = out.denda || [];

            let cjudul = (kec === '000') 
                ? 'Penerimaan Pajak per Kecamatan' 
                : 'Penerimaan Pajak per Kelurahan';

            var tipeChart = $('#tipe_chart').val();
            let seriesData = [];

            if (tipeChart === 'pie') {
                namaGroup.forEach(function(nm, i) {
                    let total = (pokok[i] || 0) + (denda[i] || 0);
                    seriesData.push({ name: nm, y: total });
                });
            }

            // Hitung total semua Pokok + Denda
            let totalKeseluruhan = 0;
            pokok.forEach((v, i) => {
                totalKeseluruhan += (v || 0) + (denda[i] || 0);
            });

            Highcharts.chart('container-penerimaan', {
                chart: { 
                    type: tipeChart, 
                    backgroundColor: '#ffffff',
                    style: { fontFamily: 'Segoe UI, Roboto, sans-serif' }
                },
                colors: ['#4e79a7', '#f28e2b', '#76b7b2', '#e15759', '#59a14f', '#edc949'],
                title: { 
                    text: cjudul,
                    style: { fontSize: '18px', fontWeight: 'bold', color: '#333' }
                },
                subtitle: (tipeChart !== 'pie') ? {
                    text: 'Total Penerimaan: <b>' + Highcharts.numberFormat(totalKeseluruhan, 0, ',', '.') + '</b>',
                    style: { fontSize: '14px', color: '#666' }
                } : undefined,
                legend: {
                    backgroundColor: '#f9f9f9',
                    borderRadius: 5,
                    itemStyle: { fontWeight: 'normal', color: '#333' },
                    itemHoverStyle: { color: '#000' }
                },
                xAxis: (tipeChart !== 'pie') ? { 
                    categories: namaGroup,
                    labels: { style: { fontSize: '12px', color: '#444' } }
                } : undefined,
                yAxis: (tipeChart !== 'pie') ? {
                    min: 0,
                    title: { text: 'Jumlah (Rp)', align: 'high', style: { fontWeight: 'bold' } },
                    labels: {
                        formatter: function () {
                            return Highcharts.numberFormat(this.value, 0, ',', '.');
                        },
                        style: { fontSize: '12px', color: '#444' }
                    },
                    gridLineColor: '#e6e6e6'
                } : undefined,
                tooltip: { 
                    backgroundColor: '#ffffff',
                    borderColor: '#ccc',
                    borderRadius: 8,
                    shadow: true,
                    style: { fontSize: '12px' },
                    shared: (tipeChart !== 'pie'),
                    formatter: function () {
                        if (this.series.type === 'pie') {
                            return '<b>' + this.point.name + '</b><br/>' +
                                   'Total: <b>' + Highcharts.numberFormat(this.y, 0, ',', '.') + '</b><br/>' +
                                   '(' + Highcharts.numberFormat(this.percentage, 1) + '%)';
                        } else {
                            var total = 0;
                            (this.points || [this.point]).forEach(function(p) { total += p.y; });

                            // Hitung total keseluruhan semua bar/column
                            var chart = this.points ? this.points[0].series.chart : this.point.series.chart;
                            var grandTotal = 0;
                            for (var i = 0; i < chart.series[0].data.length; i++) {
                                var sumRow = 0;
                                chart.series.forEach(function(s) {
                                    if (s.visible && s.data[i]) sumRow += s.data[i].y;
                                });
                                grandTotal += sumRow;
                            }

                            var percent = (grandTotal > 0) ? (total / grandTotal) * 100 : 0;

                            // Detail Pokok & Denda
                            var detail = (this.points || [this.point]).map(function(p) {
                                return '<span style="color:' + p.color + '">\u25CF</span> ' + 
                                       p.series.name + ': <b>' + Highcharts.numberFormat(p.y, 0, ',', '.') + '</b>';
                            }).join('<br/>');

                            return '<b>' + this.x + '</b><br/>' + detail + '<br/>' +
                                   '<span style="color:#000">\u25CF</span> Total: <b>' + 
                                   Highcharts.numberFormat(total, 0, ',', '.') + '</b> (' + 
                                   Highcharts.numberFormat(percent, 1) + '%)';
                        }
                    }
                },
                plotOptions: {
                    series: {
                        borderRadius: (tipeChart !== 'pie') ? 4 : 0,
                        shadow: (tipeChart !== 'pie'),
                        stacking: (tipeChart !== 'pie') ? 'normal' : undefined,
                        dataLabels: {
                            enabled: true,
                            style: { fontSize: '11px', color: '#111' },
                            formatter: function () {
                                return Highcharts.numberFormat(this.y, 0, ',', '.');
                            }
                        }
                    },
                    bar: { pointPadding: 0.05, borderWidth: 0 },
                    column: { pointPadding: 0.05, borderWidth: 0 },
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            style: { fontSize: '12px', fontWeight: 'bold' },
                            format: '<b>{point.name}</b><br>{point.y:,.0f} ({point.percentage:.1f} %)'
                        },
                        showInLegend: true
                    }
                },
                credits: { enabled: false },
                series: (tipeChart === 'pie') ? [{
                    name: 'Total Pajak',
                    colorByPoint: true,
                    data: seriesData
                }] : [
                    { name: 'Pokok', data: pokok },
                    { name: 'Denda', data: denda }
                ]
            });
        },
        complete: function () { $('#loading-spinner').hide(); },
        error: function () {
            $('#container-penerimaan').html("<p style='color:red;text-align:center;'>Gagal memuat data</p>");
        }
    });
}


$('#tipe_chart').on('change', function() {
    let kec = $('#kecamatan').val();
    get_potensi_kecamatan(kec);
});



function get_potensi_kecamatan(kec) {
    // Tampilkan spinner, kosongkan chart
    $('#loading-spinner').show();
    $('#container-potensi').empty();

    $.ajax({
        url: 'chart-potensi/get/' + encodeURIComponent(kec),
        type: 'POST',
        success: function (data) {
            var out       = jQuery.parseJSON(data) || {};
            var namaGroup = out.group || [];
            var progres   = out.potensi || [];
            var nama      = out.nama || '';

            if (!namaGroup.length) {
                $('#container-potensi').html(`
                    <div class="alert alert-info text-center" role="alert">
                        <b>Informasi:</b> Tidak ditemukan data potensi untuk wilayah ini
                    </div>
                `);
                $('#loading-spinner').hide();
                return;
            }

            var tipeChart = $('#tipe_chart').val() || 'column';
            let seriesData = [];

            if (tipeChart === 'pie') {
                namaGroup.forEach(function(nm, i) {
                    seriesData.push({ name: nm, y: progres[i] || 0 });
                });
            }

            // ==== Hitung total potensi ====
            const totalPotensi = progres.reduce((a, b) => a + b, 0);

            $('#container-potensi').append(`
                <div id="chart-potensi" style="width:100%; height:500px;"></div>
                <div id="summary-potensi" style="margin-top:25px;" ></div>
            `);

            Highcharts.setOptions({
                colors: ['#1f77b4', '#2ca02c', '#ff7f0e', '#d62728',
                         '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
                         '#bcbd22', '#17becf']
            });

            const cjudul = (kec === '000') 
                ? 'Potensi Wajib Pajak Kabupaten Bulungan'
                : 'Potensi Wajib Pajak Kecamatan ' + nama;

            Highcharts.chart('chart-potensi', {
                chart: { 
                    type: tipeChart, 
                    backgroundColor: 'transparent',
                    style: { fontFamily: 'Segoe UI, Roboto, sans-serif' }
                },
                title: { 
                    text: `${cjudul}`,
                    style: { fontSize: '18px', fontWeight: 'bold', color: '#00707a' }
                },
                xAxis: (tipeChart !== 'pie') ? {
                    categories: namaGroup,
                    title: { text: null },
                    labels: { style: { fontWeight: 'bold' } }
                } : undefined,
                yAxis: (tipeChart !== 'pie') ? {
                    min: 0,
                    title: { text: 'Jumlah Objek Pajak', align: 'high', style: { color: '#00707a', fontWeight: 'bold' } },
                    labels: { overflow: 'justify', formatter: function () { return this.value; } },
                    gridLineDashStyle: 'ShortDash'
                } : undefined,
                tooltip: {
                    useHTML: true,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderColor: '#00707a',
                    formatter: function() {
                        if (tipeChart === 'pie') {
                            return `<b>${this.point.name}</b><br/>Potensi: <b>${this.point.y}</b>`;
                        } else {
                            return `<b>${this.point.category}</b><br/>Potensi: <b>${this.point.y}</b>`;
                        }
                    }
                },
                plotOptions: {
                    series: {
                        dataLabels: { 
                            enabled: true,
                            style: { fontSize: '11px', fontWeight: '500' }
                        }
                    },
                    bar: { borderRadius: 4, pointPadding: 0.1 },
                    column: { borderRadius: 4, pointPadding: 0.1 },
                    pie: { 
                        allowPointSelect: true, 
                        cursor: 'pointer', 
                        showInLegend: true,
                        dataLabels: {
                            formatter: function() {
                                return `${this.point.name}: ${this.y}`;
                            }
                        }
                    },
                    line: { dataLabels: { enabled: true }, enableMouseTracking: true },
                    area: { dataLabels: { enabled: true }, enableMouseTracking: true }
                },
                legend: { align: 'center', verticalAlign: 'bottom', itemStyle: { fontWeight: 'bold' } },
                credits: { enabled: false },
                series: (tipeChart === 'pie') ? [{
                    name: 'Potensi Wajib Pajak',
                    colorByPoint: true,
                    data: seriesData
                }] : [{
                    name: 'Potensi Wajib Pajak',
                    data: progres,
                    colorByPoint: (tipeChart === 'column' || tipeChart === 'bar')
                }]
            });

            // ==== Tampilkan total potensi di bawah grafik ====
            $('#summary-potensi').html(`
                <div class="row text-center" style="gap:10px; justify-content:center;">
                    <div class="col-md-4 col-8 shadow-sm p-3 rounded-3" style="background:linear-gradient(135deg,#e3f2fd,#ffffff);">
                        <i class="fa fa-chart-bar fa-2x text-primary mb-2"></i>
                        <h6 class="mb-1" style="font-weight:600;color:#0d47a1;">Total Potensi</h6>
                        <h5 style="color:#0d47a1;">${Highcharts.numberFormat(totalPotensi, 0, ',', '.')} Objek Pajak</h5>
                    </div>
                </div>
            `);
        },
        complete: function () { $('#loading-spinner').hide(); },
        error: function () {
            $('#container-potensi').html("<p style='color:red;text-align:center;'>Gagal memuat data</p>");
        }
    });
}





	var table;
    $(document).ready(function() {
 			$('input:radio').radiocharm({
			  'uncheckable': true
			});


		$(function() {
			  $("#tahun").datepicker({
			  	minViewMode: 2,
	         	format: 'yyyy',
			    onSelect: function(dateText) {
			      display("Selected date: " + dateText + ", Current Selected Value= " + this.value);
			      $(this).change();
			    }
			  }).on("change", function() {
			    
			  });
		});


	

    });

	