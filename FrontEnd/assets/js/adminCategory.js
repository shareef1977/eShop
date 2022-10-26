if(window.location.pathname == '/admin_products'){
    $ondelete = $(".table tbody td a.delete")
    $ondelete.click(function(){
        let id = $(this).attr("data-id") 

        let request = {
        "url" : `http://localhost:7000/api/users/${id}`,
        "method":"DELETE"
        
    }
    if(confirm("Do you really want to delete this record")){
        $.ajax(request).done(function(response){
            alert("Data Deleted Successfully")
            location.reload()
        })
    }
    })
}

$(document).ready(function () {
    $('#example').DataTable();
});