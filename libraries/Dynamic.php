<?php

class Dynamic {
    private $ci;                // for CodeIgniter Super Global Reference.
    private $id_menu        = 'id="menu"';
    private $class_menu     = 'class="menu"';
    private $class_notif     = 'class="notification-item"';
    private $class_parent   = 'class="parent"';
    private $class_last     = 'class="last"';
    // --------------------------------------------------------------------
    /**
     * PHP5        Constructor
     *
     */
    function __construct()
    {
        $this->ci =& get_instance();    // get a reference to CodeIgniter.
    }
    // --------------------------------------------------------------------
    /**
     * build_menu($table, $type)
     *
     * Description:
     *
     * builds the Dynaminc dropdown menu
     * $table allows for passing in a MySQL table name for different menu tables.
     * $type is for the type of menu to display ie; topmenu, mainmenu, sidebar menu
     * or a footer menu.
     *
     * @param    string    the MySQL database table name.
     * @param    string    the type of menu to display.
     * @return    string    $html_out using CodeIgniter achor tags.
     */
	 
	function buildmenu ($parentId=0)
	{      
		$data 	= $this->ci->encrypt->decode($this->ci->session->userdata('mn'));	

		$dtMenu = array();				
		// if ($data != ''){
		$this->ci->load->model('Template_model', 'temp_model');
		$menuData = $this->ci->temp_model->getMenuItems($data);
		
		return $this->getMenu ($parentId, $menuData);
	}


    function EncryptLink ($link)
    {
        $res = str_replace('=','',base64_encode($link));
        return $res;
    }

    function DecryptLink ($link)
    {
        $res = base64_decode($link);
        return $res;
    }



// function EncryptLink($link = '', $loop = 7)
// {
//     $res = $link;
//     for ($i = 0; $i < $loop; $i++) {
//         $res = base64_encode($res);
//     }
//     return str_replace('=', '', $res);
// }



// function DecryptLink($link, $loop = 7)
// {
//     $res = $link;

//     // tambahkan padding '=' agar panjangnya kelipatan 4
//     $res .= str_repeat('=', (4 - strlen($res) % 4) % 4);

//     for ($i = 0; $i < $loop; $i++) {
//         $res = base64_decode($res);
//     }

//     return $res;
// }



// function EncryptLink($link = '', $key = 'flags', $loop = 2)
// {
//     $res = $link . $key; // gabungkan key
//     for ($i = 0; $i < $loop; $i++) {
//         $res = base64_encode($res);
//     }
//     return str_replace('=', '', $res);
// }

// function DecryptLink($link, $key = 'flags', $loop = 2)
// {
//     $res = $link;

//     for ($i = 0; $i < $loop; $i++) {
//         $res .= str_repeat('=', (4 - strlen($res) % 4) % 4);
//         $res = base64_decode($res);
//         if ($res === false) return false;
//     }

//     // hapus key di akhir
//     if (substr($res, -strlen($key)) === $key) {
//         $res = substr($res, 0, -strlen($key));
//     }

//     return $res;
// }


// ----- ok

// function EncryptLink($plaintext = '', $key = 'flags', $loop = 2)
// {
//     $iv = substr(hash('sha256', $key), 0, 16); // inisialisasi IV
//     $res = $plaintext;

//     for ($i = 0; $i < $loop; $i++) {
//         $res = openssl_encrypt($res, 'AES-256-CBC', $key, 0, $iv);
//     }

//     return str_replace('=', '', base64_encode($res));
// }

// function DecryptLink($ciphertext, $key = 'flags', $loop = 2)
// {
//     $iv = substr(hash('sha256', $key), 0, 16);
//     $res = base64_decode($ciphertext);

//     for ($i = 0; $i < $loop; $i++) {
//         $res = openssl_decrypt($res, 'AES-256-CBC', $key, 0, $iv);
//     }

//     return $res;
// }





    function get_count_notif()
    {
        $tahun   = $this->ci->session->userdata('year_selected');
        $akses   = $this->ci->session->userdata('is_admin');
        $user_id      = $this->ci->session->userdata('admin_id');
        $apps    = $this->ci->session->userdata('apps_modul');  

		
        $errCode = $this->ci->db->error();
        if ($errCode['code'] == 0) {
            $jml = $query->num_rows();
            if ($jml > 100) {
                $jml = '+99';
            }
        }else{
            $jml = 0;
        } 
        

        return $jml;
    }


    function get_notif ()
    {
        date_default_timezone_set('Asia/Jakarta');
        $data   = $this->ci->encrypt->decode($this->ci->session->userdata('mn'));
        
        
        $dtMenu = array();
        $menu   = array();
        $akses          = $this->ci->session->userdata('is_admin'); 
        $user_id      = $this->ci->session->userdata('user_id');  

			$q      = " SELECT a.* FROM thistory a inner join ms_user b on a.user_id=b.id_user WHERE a.status = 'BELUM DIBACA'  
						and a.tampil=1  and a.status<>1  ORDER BY a.user_date desc LIMIT 4";
			$query  = $this->ci->db->query($q);
		
   
        $html_out = "";
        if ($query->num_rows() > 0)
        {
            foreach ($query->result() as $row)
            {
                $id         = $row->id;
                $_id        = $this->EncryptLink($id);
				
				// $jenis         = $row->jenis;
				$nilai         = $row->nilai;
				$uraianaksi    = $row->uraian;
				$cketerangan   = $row->keterangan;
		
			
			if($nilai==0){
				$cicon = '<i class="fa fa-unlock fa-2x" style="color: #069A8E;"></i>';
				$uraianaksi=$uraianaksi.'&nbsp;&nbsp;&nbsp;&nbsp;'.$cicon;

				
			}else{
				$cicon = '<i class="fa fa-lock fa-2x" style="color: #D61C4E;"></i>';
				$uraianaksi=$uraianaksi.'&nbsp;&nbsp;&nbsp;&nbsp;'.$cicon;

			}
			
		

                $aksi       = $row->aksi;
                
                $routes 	= $row->routes;
                $_routes 	= $this->EncryptLink($routes);

                $tgl_aksi = $row->user_date;
                $user_id = $row->user_id;
                $cekNamaUser = $this->ci->db->get_where('ms_user',array('id_user'=>$user_id))->row();
                $tgl_act = strtotime($tgl_aksi);
                $tgl_now = strtotime("now");
        
				$cont = $_routes;
				$link = base_url($cont);
                  

                $diff = $tgl_now-$tgl_act;
                $d = floor($diff / (60 * 60 * 24));
                if ($d == 0) {
                    // jam saja
                    $ret= date('H:i', strtotime($tgl_aksi));
                }elseif ($d== 1) {
                    // kemarin dan jam
                    $retJam= date('H:i', strtotime($tgl_aksi));
                    $ret = 'Kemarin';
                }elseif ($d>1 && $d<7) {
                    // n hari lalu
                    $ret = $d.' Hari lalu';
                }elseif ($d==7) {
                    // 1 minggu lalu
                    $ret = 'Seminggu Lalu';
                }else{
                    // tanggal jam
                    $ret = date('d-m-Y', strtotime($tgl_aksi));
                }

                $sts = $row->status;
                if ($sts =='DILIHAT') {
                    $dot = " ";
                }else{
                    $dot = " bg-unread ";
                }
                // $d = $tgl_now->diff($tgl_act)->days + 1;
                if ($aksi == 'DELETEFILE' || $aksi == 'UPLOAD') {
                    $aktor = '';
                }else{
                    $aktor = '['.$cekNamaUser->name.']';
                }
 
                    $html_out.='<li class="'.$dot.'"><a href="'.$link.'" class="notification-item" onclick="update_view('.$id.')"><span class=""></span>
                    '.$uraianaksi.
                    '<p class="pull-right" style="font-color:#ccc;padding-top:15px;"><i>'.$ret.'</i></p></a></li>';
					
					
            
			//   }
            }
        }
        $query->free_result();
        
        return $html_out;
    }  
	
	function getMenu ($parentId, $menuData)
	{
		$menu 	= array();
		$html 	= '';
		
		if (isset($menuData['parents'][$parentId]))
		{
			$html = '<ul>';
			foreach ($menuData['parents'][$parentId] as $itemId)
			{
				$html .= '<li>' . $menuData['items'][$itemId]['title'];

				// find childitems recursively
				$html .= $this->getMenu($itemId, $menuData);

				$html .= '</li>';
			}
			$html .= '</ul>';
		}

		return $html;
		

	}
	
    function build_menu2 ($table = 'sys_menu', $type = '2')
    {
        $data   = $this->ci->encrypt->decode($this->ci->session->userdata('mn'));
        
        if ($data == '') {
            redirect(base_url()); 
        }else{
            $dtMenu = array();
            $menu   = array();
            
            $q      = "SELECT * FROM sys_menu WHERE id_menu IN  (".$data.") order by urut";
            
            $query  = $this->ci->db->query($q);

            
            if ($query->num_rows() > 0)
            {
                foreach ($query->result() as $row)
                {
                    $menu[$row->id_menu]['id']            = $row->id_menu;
                    $menu[$row->id_menu]['title']        = $row->title;
                    $menu[$row->id_menu]['link']            = $row->link_type;
                    $menu[$row->id_menu]['page']            = $row->page_id;
                    $menu[$row->id_menu]['module']        = $row->module_name;
                    $menu[$row->id_menu]['url']            = $row->url;
                    $menu[$row->id_menu]['uri']            = $row->uri;
                    // $menu[$row->id]['dyn_group']    = $row->dyn_group_id;
                    $menu[$row->id_menu]['position']        = $row->position;
                    $menu[$row->id_menu]['target']        = $row->target;
                    $menu[$row->id_menu]['parent']        = $row->parent_id;
                    $menu[$row->id_menu]['is_parent']    = $row->is_parent;
                    $menu[$row->id_menu]['show']            = $row->show_menu;
                    $menu[$row->id_menu]['icon']            = $row->icon;
                }
            }else{
                header("location: base_url()",TRUE,301);
            }
            $query->free_result();
            // ----------------------------------------------------------------------
            
            // $menu= array_values($menu);
            // print_r($menu);
            // now we will build the dynamic menus.
            $html_out  = ""; //"\t".'<div '.$this->id_menu.'>'."\n";
            /**
             * check $type for the type of menu to display.
             *
             * ( 0 = top menu ) ( 1 = horizontal ) ( 2 = vertical ) ( 3 = footer menu ).
             */
            switch ($type)
            {
                case 0:            // 0 = top menu
                    break;
                case 1:            // 1 = horizontal menu
                    $html_out .= "\t\t".'<ul '.$this->class_menu.'>'."\n";
                    break;
                case 2:            // 2 = sidebar menu
                    $html_out .= "<ul>";
                    break;
                case 3:            // 3 = footer menu
                    break;
                default:        // default = horizontal menu
                    $html_out .= "\t\t".'<ul '.$this->class_menu.'>'."\n";
                    break;
            }
            
            // loop through the $menu array() and build the parent menus.
            // for ($i = 1; $i < count($menu); $i++)
            foreach($menu as $i => $item)
            {
                if (is_array($menu[$i]))    // must be by construction but let's keep the errors home
                {
                    if ($menu[$i]['show'] && $menu[$i]['parent'] == 0)    // are we allowed to see this menu?
                    {
                        $seg1 = $this->DecryptLink($this->ci->uri->segment(1));
                        if ($menu[$i]['is_parent'] == TRUE)
                        {
                            $ql     = "SELECT *, CASE WHEN parent_id > 0 THEN (select parent_id from sys_menu a where a.id_menu = b.parent_id) 
                                      ELSE 0 END AS baseP FROM sys_menu b WHERE url = '".$seg1."' ";
                             
                            $qry    = $this->ci->db->query($ql)->row();
                            
                            $pClass     = ( ($qry->baseP > 0 && $qry->baseP == $menu[$i]['id']) || ($qry->baseP == 0 && $qry->parent_id == $menu[$i]['id'])) ? "selected" : ""; 
                            $collapseP  = ( ($qry->baseP > 0 && $qry->baseP == $menu[$i]['id']) || ($qry->baseP == 0 && $qry->parent_id == $menu[$i]['id'])) ? "open"   : ""; 
                            $collapse   = ( ($qry->baseP > 0 && $qry->baseP == $menu[$i]['id'])) ? "open"   : ""; 
                            // vdebug($collapse);
                            // $html_out .= '<li class="'.$pClass.'has-sub'.$collapse.'"><a href="'.base_url().$menu[$i]['url'].'"><span>'.$menu[$i]['title'].'</span></a>';
                            $html_out .= '<li class="'.$pClass.' has-sub '.$collapse.'"><a href="#"><span>'.$menu[$i]['icon'].$menu[$i]['title'].'</span></a>';
                        }
                        else {
                            // $html_out .= "\t\t\t\t".'<li>'.anchor($menu[$i]['url'], '<span>'.$menu[$i]['title'].'</span>');
                            $sel        = ($this->ci->uri->segment(1)==$this->EncryptLink($menu[$i]['url'])) ? "selected"   : "";
                            $html_out .= '<li class="'.$sel.'"><a href="'.base_url().$this->EncryptLink($menu[$i]['url']).'"><span>'.$menu[$i]['icon'].$menu[$i]['title'].'</span></a>';
                        }
                        // loop through and build all the child submenus.
                        
                        $html_out .= $this->get_childs($menu, $i, $collapseP, $collapse);
                        $html_out .= '</li>'."\n";
                    }
                }
                else
                {
                    exit (sprintf('menu nr %s must be an array', $i));
                }
            }
            $html_out .= "\t\t".'</ul>' . "\n";
            // $html_out .= "\t".'</div>' . "\n";
            return $html_out;
        }  
    }
		
	    /**
     * get_childs($menu, $parent_id) - SEE Above Method.
     *
     * Description:
     *
     * Builds all child submenus using a recurse method call.
     *
     * @param    mixed    $menu    array()
     * @param    string    $parent_id    id of parent calling this method.
     * @return    mixed    $html_out if has subcats else FALSE
     */
    function get_childs($menu, $parent_id, $collapseP='', $collapse='')
    {
        $has_subcats = FALSE;
        $html_out  = '';

        // $html_out .= "\n\t\t\t\t".'<div>'."\n";
        $html_out .= '<ul style="display:'.($collapseP=='open'?'block':'none').';">';
        // $html_out .= '<ul>';
        // for ($i = 1; $i <= count($menu); $i++)
		foreach($menu as $i => $item)
        {
            $seg1 = $this->DecryptLink($this->ci->uri->segment(1));
            if ($menu[$i]['show'] && $menu[$i]['parent'] == $parent_id)    // are we allowed to see this menu?
            {
				$pClass 	= ($seg1==$menu[$i]['url']) ? "active" 	: "";
				// $collapseP 	= ($this->ci->uri->segment(1)==$menu[$i]['url']) ? "open" 		: "";
				$sel 		= ($seg1==$menu[$i]['url']) ? "selected" 	: "";
				
                $has_subcats = TRUE;
                if ($menu[$i]['is_parent'] == TRUE)
                {
					// $html_out .= "\t\t\t\t\t\t".'<li>'.anchor($menu[$i]['url'].' '.$this->class_parent, '<span>'.$menu[$i]['title'].'</span>');
                    $html_out .= '<li class="'.$pClass.' has-sub '.$collapse.'"><a href="'.base_url().$menu[$i]['url'].'"><span>'.$menu[$i]['title'].'</span></a>';
                }
                else
                {
                    $html_out .= '<li class="'.$sel.'">'.anchor($this->EncryptLink($menu[$i]['url']), '<span>'.$menu[$i]['title'].'</span>');
                }
                // Recurse call to get more child submenus.
                $html_out .= $this->get_childs($menu, $i, $collapseP, $collapse);
                $html_out .= '</li>' . "\n";
            }
        }
        $html_out .= "\t\t\t\t\t".'</ul>' . "\n";
         // $html_out .= "\t\t\t\t".'</div>' . "\n";
        return ($has_subcats) ? $html_out : FALSE;
    }
	
	
	function update_view($cid){
		
	
			$hsql = "UPDATE thistory SET status=1 WHERE id='".$cid."'";		
			$data = $this->db->query($hsql);
		
		
	}	
	
}
// ------------------------------------------------------------------------
// End of Dynamic_menu Library Class.
// ------------------------------------------------------------------------
/* End of file Dynamic_menu.php */
/* Location: ../application/libraries/Dynamic_menu.php */  