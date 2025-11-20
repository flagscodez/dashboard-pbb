
	
  $(window).on('load', function () {
  		$(function () {
	  		$('[data-toggle="tooltip"]').tooltip();
       
			 
		});
				// Treeview Initialization
		$(document).ready(function() {
      
		//  get_potensi_kecamatan();
      document.getElementById("popupPenerimaan").style.display = "none";	
		  $('.treeview-animated').mdbTreeview();
		 
		});

	});


	$(document).ready(function () {
    
     get_potensi_kecamatan();
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


	});	


   function showPopupKecamatan(kec) {

      $.ajax({
        url: 'master-mkecamatan-get/' + encodeURIComponent(kec),
        type: 'POST',
        dataType: "json",
        success: function(data){
          document.getElementById("popupImage").src = "data:image/jpeg;base64," + data.foto;
          document.getElementById("popupNama").innerText   = "KECAMATAN "+data.nm_kecamatan;
          document.getElementById("popupAlamat").innerText = data.alamat;
          document.getElementById("popupTelp").innerText   = data.telp;
          document.getElementById("popupKdkec").innerText   = data.kd_kecamatan;
          document.getElementById("popupKecamatan").style.display = "flex";


          document.getElementById("dataImage").src = "data:image/jpeg;base64," + data.foto;
          document.getElementById("dataNama").innerText   = "KECAMATAN "+data.nm_kecamatan;
          document.getElementById("dataAlamat").innerText = data.alamat;
          document.getElementById("dataTelp").innerText   = data.telp;
          document.getElementById("dataKdkec").innerText   = data.kd_kecamatan;
         


        },
        error: function(xhr){
          console.error(xhr.responseText);
        }
      });

    }

    

    function closePopup() {
      document.getElementById("popupKecamatan").style.display = "none";
      document.getElementById("popupPenerimaan").style.display = "none";

    }

    function showPeriode() {
      document.getElementById("popupKecamatan").style.display = "none";
      document.getElementById("popupPenerimaan").style.display = "flex";


    }




function get_potensi_kecamatan() {
    var el = document.getElementById("popupKdkec").innerText;
    var nmkec = document.getElementById("popupNama").innerText;
      nmkec = nmkec
        .toLowerCase()
        .replace(/\b\w/g, function(l) { return l.toUpperCase(); });

      document.getElementById("lbpanel").innerText = "Potensi Wajib Pajak";  
      document.getElementById("popupNama").innerText = nmkec;
      // $('#loading-spinner-popup').show();

      if (el !==''){
          var kec = el.slice(-3);
          var nmkec=nmkec;
          $('#div-data-kecamatan').show();
          $('#div-table-kecamatan').hide();
      }else{
          kec = '000';
          nmkec ='';
          $('#div-data-kecamatan').hide();
          $('#div-table-kecamatan').show();
      }
    
    $('#loading-spinner').show();
    $('#container-potensi').empty();


    if(kec=='000'){
      instansi='KECAMATAN';
    }else{
      instansi='KELURAHAN';
    }

 
      $.ajax({
        url: 'chart-potensi/get/' + encodeURIComponent(kec),
        type: 'POST',
        success: function (data) {
            var out       = jQuery.parseJSON(data);
            var namaGroup = out.group;
            var progres   = out.potensi;

            var pieData = [];
            for (var i = 0; i < namaGroup.length; i++) {
                pieData.push({
                    name: namaGroup[i],
                    y: parseFloat(progres[i]) || 0
                });
            }

            Highcharts.setOptions({
                colors: ['#1f77b4', '#2ca02c', '#ff7f0e', '#d62728',
                        '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
                        '#bcbd22', '#17becf']
            });
            var instansiFormatted = instansi.charAt(0).toUpperCase() + instansi.slice(1).toLowerCase();

                Highcharts.chart('container-potensi', {
                    chart: { 
                        type: 'pie',
                        events: {
                            render: function () {
                                var chart = this;
                                var total = pieData.reduce((sum, item) => sum + item.y, 0);

                                // Hapus label lama kalau ada
                                if (chart.customLabel) {
                                    chart.customLabel.destroy();
                                }

                                // Tambahkan label di tengah donat
                                chart.customLabel = chart.renderer.text(
                                    '<div style="text-align:center;">' +
                                        '<span style="font-size:12px; color:#f22f42;">Total</span><br>' +
                                        '<span style="font-size:14px; font-weight:bold; color:#00809D;">' +
                                        Highcharts.numberFormat(total, 0, ',', '.') +
                                        '</span>' +
                                    '</div>',
                                    chart.plotLeft + chart.plotWidth / 2,
                                    chart.plotTop + chart.plotHeight / 2
                                )
                                .attr({
                                    align: 'center',
                                    zIndex: 5,
                                    useHTML: true
                                })
                                .add();
                            }
                        }
                    },
                    title: { 
                        text: nmkec + '<br>Potensi Wajib Pajak ' + instansiFormatted, 
                        style: {
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#00809D'
                        }
                    },
                    tooltip: {
                        pointFormat: '{point.percentage:.1f}% ({point.y})'
                    },
                    accessibility: {
                        point: { valueSuffix: '%' }
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            innerSize: '55%', // donat lebih tebal
                            dataLabels: {
                                enabled: true,
                                format: '{point.name}: {point.percentage:.1f}%'
                            }
                        }
                    },
                    credits: { enabled: false },
                    series: [{
                        name: 'POTENSI WAJIB PAJAK',
                        colorByPoint: true,
                        data: pieData
                    }]
                });



            // Tampilkan list kecamatan + jumlah potensi
            var htmlList = "<table>";
            htmlList += "<thead ><tr><th>"+instansi+" </th><th style='text-align:center;'>POTENSI</th></tr></thead><tbody>";
            let totalProgres = 0;
            for (var i = 0; i < namaGroup.length; i++) {
               
              let progresVal = progres[i] || 0;
                  totalProgres += progresVal;

                htmlList += "<tr>";
                htmlList += "<td>" + capitalizeWords(instansi)+" " +capitalizeWords(namaGroup[i]) + "</td>";
                htmlList += "<td class='num'>" +  ( (progres[i] || 0).toLocaleString('id-ID') )  + "</td>";
                htmlList += "</tr>";

                
            }

         //   Tambahkan baris total
            htmlList += "<tr style='font-weight:bold; background:#d8a25e;'>";
            htmlList += "<td style='text-align:center;'><b>TOTAL</b></td>";
            htmlList += "<td class='num' style='text-align:center;'><b>" + totalProgres.toLocaleString('id-ID') + "</b></td>";
            htmlList += "</tr>";            

            htmlList += "</tbody></table>";
            $('#list-potensi').html(htmlList);


        },
        complete: function () {
           
            $('#loading-spinner').hide();
            closePopup();
            get_efektivitas();

        },
        error: function () {
            $('#container-potensi').html("<p style='color:red;text-align:center;'>Gagal memuat data</p>");
        }
    });
}

function formatToYMD(dateStr) {
  const parts = dateStr.split('-'); 
  const d = new Date(parts[2], parts[1] - 1, parts[0]); // (Y, M-1, D)

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}



function get_penerimaan_kecamatan() {
    const _startDate = document.getElementById('start_date').value;
    const _endDate   = document.getElementById('end_date').value;
    const startDate  = formatToYMD(_startDate);
    const endDate    = formatToYMD(_endDate);

    let el    = document.getElementById("popupKdkec").innerText || "";
    let nmkec = (document.getElementById("popupNama").innerText || "")
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
    document.getElementById("lbpanel").innerText = "Realisasi Penerimaan Pajak"; 
    document.getElementById("popupNama").innerText = nmkec;

    let kec = "000";
    if (el.trim() !== "" && el.length >= 3) {
        kec = el.slice(-3);
        $('#div-data-kecamatan').show();
        $('#div-table-kecamatan').hide();
    } else {
        nmkec = "";
        $('#div-data-kecamatan').hide();
        $('#div-table-kecamatan').show();
    }

    $('#loading-spinner').show();
    $('#container-potensi').empty();

    const instansi  = (kec === "000") ? "KECAMATAN" : "KELURAHAN";
    const tipeChart = 'column';

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
                $('#container-potensi').html("<p style='color:red;text-align:center;'>Data tidak Ditemukan</p>");
                return;
            }

            const namaGroup = out.group || [];
            const pokok     = (out.pokok || []).map(v => v || 0);
            const denda     = (out.denda || []).map(v => v || 0);

            if (!namaGroup.length) {
                $('#container-potensi').html(`
                    <div class="alert alert-info alert-dismissible" role="alert">
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <center><b>Informasi</b> Tidak ditemukan data untuk periode ini</center>
                    </div>
                `);
                return;
            }

            const cjudul = (kec === '000') 
                ? `Penerimaan pajak per kecamatan<br>Periode ${formatTanggalIndonesia(startDate)} s/d ${formatTanggalIndonesia(endDate)}`
                : `Penerimaan Pajak ${nmkec}<br>Periode ${formatTanggalIndonesia(startDate)} s/d ${formatTanggalIndonesia(endDate)}`;

            let chartOptions = {
                chart: { type: tipeChart, backgroundColor: '#ffffff', style: { fontFamily: 'Segoe UI, Roboto, sans-serif' } },
                colors: ['#4e79a7','#f28e2b','#76b7b2','#e15759','#59a14f','#edc949'],               
                title: {
                    useHTML: true,
                    text: cjudul,
                    style: { fontSize: '14px', fontWeight: 'bold', color: '#00809d', lineHeight: '1.4em' }
                },
                credits: { enabled: false },
                tooltip: {},
                plotOptions: {}
            };

            if (tipeChart === 'pie') {
                let seriesData = [];
                namaGroup.forEach((nm, i) => {
                    seriesData.push({ name: nm, y: pokok[i] + denda[i] });
                });

                chartOptions.series = [{ name:'Total Pajak', colorByPoint:true, data:seriesData }];
                chartOptions.plotOptions.pie = {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    showInLegend: true,
                    dataLabels: { enabled:true, format:'<b>{point.name}</b><br>{point.y:,.0f} ({point.percentage:.1f}%)' }
                };
                chartOptions.tooltip.formatter = function() {
                    return `<b>${this.point.name}</b><br/>
                            Total: <b>${Highcharts.numberFormat(this.point.y,0,',','.')}</b><br/>
                            (${Highcharts.numberFormat(this.point.percentage,1)}%)`;
                };

            } else {
                chartOptions.xAxis = { categories: namaGroup };
                chartOptions.yAxis = { min:0, title:{ text:'Jumlah (Rp)', style:{ fontWeight:'bold' } } };
                chartOptions.series = [
                    { name:'Pokok', data:pokok },
                    { name:'Denda', data:denda }
                ];
                chartOptions.plotOptions.series = {
                    borderRadius: 4,
                    stacking: 'normal',
                    dataLabels: { enabled:true, formatter:function(){ return Highcharts.numberFormat(this.y,0,',','.'); } }
                };
                chartOptions.tooltip.formatter = function() {
                    const index = this.point.index;
                    const pokokValue = pokok[index] || 0;
                    const dendaValue = denda[index] || 0;
                    const total = pokokValue + dendaValue;

                    return `<p style="color:#007074; font-weight:bold; margin:0;">${this.point.category}</p><br/>
                            Pokok  : <b style="color:#4e79a7;">${Highcharts.numberFormat(pokokValue,0,',','.')}</b><br/>
                            Denda  : <b style="color:#e15759;">${Highcharts.numberFormat(dendaValue,0,',','.')}</b><br/>
                            Total  : <b style="color:#2ca02c;">${Highcharts.numberFormat(total,0,',','.')}</b>`;
                };
            }

            Highcharts.chart('container-potensi', chartOptions);

            // Tampilkan list kecamatan + jumlah potensi
              let htmlList = "<table>";
              htmlList += "<thead><tr><th>" + instansi + "</th><th style='text-align:center;'>POKOK</th><th style='text-align:center;'>DENDA</th><th style='text-align:center;'>JUMLAH</th></tr></thead><tbody>";
              
              let totalPokok = 0;
              let totalDenda = 0;
              let totalSemua = 0;
              for (let i = 0; i < namaGroup.length; i++) {
                  let pokokVal = pokok[i] || 0;
                  let dendaVal = denda[i] || 0;
                  let total    = pokokVal + dendaVal;

                      totalPokok += pokokVal;
                      totalDenda += dendaVal;
                      totalSemua += total;

                  htmlList += "<tr>";
                  htmlList += "<td>" + capitalizeWords(namaGroup[i]) + "</td>";
                  htmlList += "<td class='num' style='text-align:right;'>" + pokokVal.toLocaleString('id-ID') + "</td>";
                  htmlList += "<td class='num' style='text-align:right;'>" + dendaVal.toLocaleString('id-ID') + "</td>";
                  htmlList += "<td class='num' style='text-align:right;'>" + total.toLocaleString('id-ID') + "</td>";
                  htmlList += "</tr>";
            }

            // Tambahkan baris total
            htmlList += "<tr style='font-weight:bold; background:#d8a25e;'>";
            htmlList += "<td style='text-align:center;'><b>TOTAL</b></td>";
            htmlList += "<td class='num' style='text-align:right;'><b>" + totalPokok.toLocaleString('id-ID') + "</b></td>";
            htmlList += "<td class='num' style='text-align:right;'><b>" + totalDenda.toLocaleString('id-ID') + "</b></td>";
            htmlList += "<td class='num' style='text-align:right;'><b>" + totalSemua.toLocaleString('id-ID') + "</b></td>";
            htmlList += "</tr>";


            htmlList += "</tbody></table>";
            $('#list-potensi').html(htmlList);
        },

        complete: function(){ 
            $('#loading-spinner').hide(); 
            document.getElementById("popupPenerimaan").style.display = "none";
            get_efektivitas();
        },
        error: function(){ 
            $('#container-potensi').html("<p style='color:red;text-align:center;'>Gagal memuat data</p>"); 
        }
    });

    
}

function capitalizeWords(str) {
    return str
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
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

function get_efektivitas(){
        $.ajax({  
                url: 'dashboard-efektivitas/get',
                type: 'POST',
                success: function(data){
                $("#data-header").html(data);
                
                }
            });	
    
    }


